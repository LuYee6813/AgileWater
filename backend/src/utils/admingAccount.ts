import bcrypt from 'bcrypt';

import { User } from '../models/User';

export async function ensureAdminAccount() {
  const adminExists = await User.findOne({ username: 'admin' });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin', 10); // Default password: admin
    const adminUser = new User({
      username: 'admin',
      password: hashedPassword,
      nickname: 'Admin',
      admin: true
    });

    await adminUser.save();
    console.warn(
      'Default admin account created with username: admin and password: admin, please change the password immediately'
    );
  }
}
