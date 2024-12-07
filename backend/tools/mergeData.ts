import fs from 'fs';

interface RawLocation {
  sn: number;
  lat: string;
  lng: string;
  access: string;
}

interface RawReview {
  sn: number;
  response: {
    Payload: {
      sn: number;
      time: string;
      sisn: string;
      star: string;
      content: string;
      name: string;
      img: string;
      usn: number;
      cmnt_img: string;
    }[];
  };
}

interface RawWaterDispenser {
  sn: number;
  response: {
    Payload: {
      lat: string;
      lng: string;
      type: string;
      name: string;
      addr: string;
      iced: string;
      cold: string;
      warm: string;
      hot: string;
      opening_hours: string;
      description: string;
      score: number;
      photo: string;
      photo_multi: string;
      path: string;
    }[];
  };
}

function mergeData(locationPath: string, infoPath: string, reviewPath: string, outputPath: string) {
  const locationData = fs.readFileSync(locationPath, 'utf8');
  const locationRawData = JSON.parse(locationData).Payload as RawLocation[];

  const infoData = fs.readFileSync(infoPath, 'utf8');
  const infoRawData = JSON.parse(infoData) as RawWaterDispenser[];

  const reviewData = fs.readFileSync(reviewPath, 'utf8');
  const reviewRawData = JSON.parse(reviewData) as RawReview[];

  const mergerdDatas = [];

  for (const location of locationRawData) {
    console.log(`Processing location ${location.sn}`);

    const info = infoRawData.find((info) => info.sn === location.sn);
    if (!info) {
      console.warn(`Info not found for location ${location.sn}`);
      continue;
    }
    const reviews = reviewRawData.find((review) => review.sn === location.sn);

    const payload = info.response.Payload[0];
    const reviewsPayload = reviews?.response.Payload;

    const photo = payload.photo;
    const photos = [];
    if (photo !== '') photos.push(photo);

    if (payload.photo_multi !== '') {
      const rawPhotos = JSON.parse(payload.photo_multi) as { img: string }[];
      for (const rawPhoto of rawPhotos) {
        if (rawPhoto.img !== '') {
          photos.push(rawPhoto.img);
        }
      }
    }

    let parsedReviews: {
      sn: number;
      usn: number;
      img: string;
      name: string;
      cmntImg: string;
      sisn: number;
      star: number;
      content: string;
      time: Date;
    }[] = [];
    if (reviewsPayload) {
      parsedReviews = reviewsPayload.map((review) => ({
        sn: review.sn,
        usn: review.usn,
        img: review.img,
        name: review.name,
        cmntImg: review.cmnt_img,
        sisn: parseInt(review.sisn),
        star: parseFloat(review.star),
        content: review.content,
        time: new Date(review.time)
      }));
    }

    const mergerdData = {
      sn: location.sn,
      access: location.access,
      lat: parseFloat(location.lat.trim()),
      lng: parseFloat(location.lng.trim()),
      type: payload.type.trim(),
      name: payload.name.trim(),
      addr: payload.addr.trim(),
      iced: payload.iced.toLowerCase() === 'yes',
      cold: payload.cold.toLowerCase() === 'yes',
      warm: payload.warm.toLowerCase() === 'yes',
      hot: payload.hot.toLowerCase() === 'yes',
      openingHours: payload.opening_hours.trim(),
      description: payload.description.trim(),
      rate: payload.score,
      photos,
      path: payload.path,
      reviews: parsedReviews
    };

    mergerdDatas.push(mergerdData);
  }

  const output = JSON.stringify(mergerdDatas, null, 2);
  fs.writeFileSync(outputPath, output);
}

mergeData('pt_location.json', 'pt_info.json', 'pt_comment.json', 'pt_mergedData.json');
