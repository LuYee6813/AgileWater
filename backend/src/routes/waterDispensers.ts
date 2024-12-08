import { Router } from 'express';

import type { AuthenticatedRequest } from '../middlewares/auth';
import { authMiddleware } from '../middlewares/auth';
import type { IReview, IWaterDispenser } from '../models/WaterDispenser';
import { WaterDispenser } from '../models/WaterDispenser';
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError
} from '../utils/errorHandler';

const router: Router = Router();

function dispenserToResponse(dispenser: IWaterDispenser) {
  return {
    ...dispenser,
    location: {
      lng: dispenser.location.coordinates[0],
      lat: dispenser.location.coordinates[1]
    }
  };
}

// GET /water_dispensers - List dispensers with optional filters
router.get('/', authMiddleware, async (req, res) => {
  const { offset = 0, limit = 10, lat, lng, radius, iced, cold, warm, hot, name, sort } = req.query;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: any = {};
  if (iced) filters.iced = iced === 'true';
  if (cold) filters.cold = cold === 'true';
  if (warm) filters.warm = warm === 'true';
  if (hot) filters.hot = hot === 'true';
  if (name) filters.name = new RegExp(name as string, 'i');

  let geoQuery = null;

  // Filter by location and radius
  if (lat || lng || radius) {
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const distance = parseFloat(radius as string); // meters

    if (isNaN(latitude) || isNaN(longitude) || isNaN(distance)) {
      res.status(400).json({
        ...BadRequestError,
        message: 'lat, lng, and radius must be valid numbers'
      });
      return;
    }

    geoQuery = {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [longitude, latitude] // GeoJSON format：[lng, lat]
        },
        distanceField: 'distance', // Fields containing calculation distance
        spherical: true // Use spherical distance formula
      } as unknown as Record<string, unknown>
    };

    if (distance >= 0) {
      geoQuery.$geoNear.maxDistance = distance; // radius
    }
  }

  try {
    // MongoDB Pipeline
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = [];

    // if enabled geo filter, add $geoNear
    if (geoQuery) {
      pipeline.push(geoQuery);

      // sort
      if (sort === 'distance') {
        pipeline.push({ $sort: { distance: 1 } }); // sort by distance
      } else {
        pipeline.push({ $sort: { distance: 1 } }); // sort by distance
      }
    }

    // add filters
    if (Object.keys(filters).length > 0) {
      pipeline.push({ $match: filters });
    }

    // Calculate total count
    const totalCountPipeline = [...pipeline, { $count: 'totalCount' }];
    const totalCountResult = await WaterDispenser.aggregate(totalCountPipeline);
    const totalItems = totalCountResult[0]?.totalCount || 0;

    // add skip and limit if limit >= 0
    if (Number(limit) >= 0) {
      pipeline.push({ $skip: Number(offset) });
      pipeline.push({ $limit: Number(limit) });
    }

    // exclude _id, __v, reviews._id
    pipeline.push({
      $project: {
        _id: 0,
        __v: 0,
        'reviews._id': 0
      }
    });

    const dispensers = await WaterDispenser.aggregate(pipeline);

    // Map `coordinates` to `{ location: { lng, lat } }`
    const transformed = dispensers.map(dispenserToResponse);

    // Set X-Total-Count header
    res.set('X-Total-Count', totalItems.toString());
    res.status(200).json(transformed);
  } catch (err) {
    console.error(err);
    res.status(500).json(InternalServerError);
  }
});

// GET /water_dispensers/:sn - Get dispenser details
router.get('/:sn', authMiddleware, async (req, res) => {
  const { sn } = req.params;
  const { lat, lng } = req.query;

  try {
    // MongoDB Pipeline
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = [
      // Filter by sn
      { $match: { sn: Number(sn) } }
    ];

    // Add $geoNear to calculate distance if lat and lng are provided
    if (lat || lng) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);

      if (isNaN(latitude) || isNaN(longitude)) {
        res.status(400).json({
          ...BadRequestError,
          message: 'lat and lng must be valid numbers'
        });
        return;
      }

      pipeline.unshift({
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude] // GeoJSON format: [lng, lat]
          },
          distanceField: 'distance', // Field containing calculation distance
          spherical: true // Use spherical distance formula
        }
      });
    }

    // Add $limit to get only one result
    pipeline.push({ $limit: Number(1) });

    // Exclude _id, __v, reviews._id
    pipeline.push({
      $project: {
        _id: 0,
        __v: 0,
        'reviews._id': 0
      }
    });

    // Execute the pipeline
    const result = await WaterDispenser.aggregate(pipeline);

    if (result.length === 0) {
      res.status(404).json({ ...NotFoundError, message: 'Water dispenser not found' });
      return;
    }

    // Respond with the first result
    const dispenser = result[0];
    res.status(200).json(dispenserToResponse(dispenser));
  } catch (err) {
    console.error(err);
    res.status(500).json(InternalServerError);
  }
});

// POST /water_dispensers/:water_dispenser_sn/reviews - Create a new review for a water dispenser
router.post(
  '/:water_dispenser_sn/reviews',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { water_dispenser_sn: waterSispenserSn } = req.params;
    const { star, content } = req.body;

    if (!req.user) {
      console.error('User not found in request');
      res.status(500).json(InternalServerError);
      return;
    }

    // Validate request body
    if (!star || !content || isNaN(Number(star)) || Number(star) < 1.0 || Number(star) > 5.0) {
      res.status(400).json({
        ...BadRequestError,
        message: 'Star must be between 1.0 and 5.0, and content is required.'
      });
      return;
    }

    try {
      // Find the water dispenser
      const dispenser = await WaterDispenser.findOne({
        sn: waterSispenserSn
      });
      if (!dispenser) {
        res.status(404).json({ ...NotFoundError, message: 'Water dispenser not found' });
        return;
      }

      const maxSn = dispenser.reviews.reduce((max, review) => {
        return review.sn > max ? review.sn : max;
      }, 0);
      const newReviewSn = maxSn + 1;

      const time = new Date();

      // Create a new review
      const review: IReview = {
        sn: newReviewSn, // Review ID
        username: req.user.username, // User ID of the reviewer
        star: Number(star), // Rating: 1.0 ~ 5.0
        content, // Review content
        time, // Time of the review
        stolen: false // Indicates if the review is stolen
      };

      // Add the review to the dispenser
      dispenser.reviews.push(review);

      // Update overall rate
      dispenser.rate =
        dispenser.reviews.reduce((sum, r) => sum + r.star, 0) / dispenser.reviews.length;

      await dispenser.save();

      // Respond with the created review
      res.status(201).json({
        sn: review.sn,
        username: req.user.username,
        cmntImg: review.cmntImg,
        star: review.star,
        content: review.content,
        time: time.toISOString(),
        stolen: review.stolen
      });
    } catch (err) {
      console.error(err);
      res.status(500).json(InternalServerError);
    }
  }
);

// PUT /water_dispensers/:water_dispenser_sn/reviews/:review_sn
// - Update a review for a water dispenser.
router.put(
  '/:water_dispenser_sn/reviews/:review_sn',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { water_dispenser_sn: waterDispenserSn, review_sn: reviewSn } = req.params;
    const { star, content } = req.body;

    if (!req.user) {
      console.error('User not found in request');
      res.status(500).json(InternalServerError);
      return;
    }

    // Validate request body
    if (star && (star < 1.0 || star > 5.0)) {
      res.status(400).json({
        ...BadRequestError,
        message: 'Star must be between 1.0 and 5.0.'
      });
      return;
    }
    if (content && typeof content !== 'string') {
      res.status(400).json({
        ...BadRequestError,
        message: 'Content must be a string.'
      });
      return;
    }

    try {
      // Find the water dispenser
      const dispenser = await WaterDispenser.findOne({
        sn: waterDispenserSn
      });
      if (!dispenser) {
        res.status(404).json({ ...NotFoundError, message: 'Water dispenser not found' });
        return;
      }

      // Find the review
      const review = dispenser.reviews.find((r) => r.sn === parseInt(reviewSn));
      if (!review) {
        res.status(404).json({ ...NotFoundError, message: 'Review not found' });
        return;
      }

      // Make sure the user can only modify their own reviews unless they are an admin
      if (!req.user.admin && review.username !== req.user.username) {
        res.status(403).json(ForbiddenError);
        return;
      }

      // Update the review
      if (star) review.star = star;
      if (content) review.content = content;

      // Save the updated dispenser
      await dispenser.save();

      // Respond with the updated review
      res.status(200).json({
        sn: dispenser.sn,
        username: req.user.username,
        cmntImg: review.cmntImg,
        star: review.star,
        content: review.content,
        time: review.time.toISOString(),
        stolen: review.stolen
      });
    } catch (err) {
      console.error(err);
      res.status(500).json(InternalServerError);
    }
  }
);

// DELETE /water_dispensers/:water_dispenser_sn/reviews/:review_sn - Delete a review
router.delete(
  '/:water_dispenser_sn/reviews/:review_sn',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const { water_dispenser_sn: waterDispenserSn, review_sn: reviewSn } = req.params;

    if (!req.user) {
      console.error('User not found in request');
      res.status(500).json(InternalServerError);
      return;
    }

    try {
      // Find the water dispenser
      const dispenser = await WaterDispenser.findOne({ sn: waterDispenserSn });
      if (!dispenser) {
        res.status(404).json({ ...NotFoundError, message: 'Water dispenser not found' });
        return;
      }

      // Find the water review
      const reviewIndex = dispenser.reviews.findIndex((r) => r.sn === parseInt(reviewSn));
      if (reviewIndex === -1) {
        res.status(404).json({ ...NotFoundError, message: 'Review not found' });
        return;
      }

      const review = dispenser.reviews[reviewIndex];

      // Make sure the user can only delete their own reviews unless they are an admin
      if (!req.user.admin && review.username !== req.user.username) {
        res
          .status(403)
          .json({ ...ForbiddenError, message: 'You can only delete your own reviews' });
        return;
      }

      // Delete the review
      dispenser.reviews.splice(reviewIndex, 1);

      // Update the overall rate
      if (dispenser.reviews.length > 0) {
        dispenser.rate =
          dispenser.reviews.reduce((sum, r) => sum + r.star, 0) / dispenser.reviews.length;
      } else {
        dispenser.rate = 0; // If there are no reviews, set to 0
      }

      await dispenser.save();

      // Respond with No Content
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).json(InternalServerError);
    }
  }
);

export default router;
