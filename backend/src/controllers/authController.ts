import User from "../models/User";

export const authController = {
  async register(body: { username: string; email: string; password: string }) {
    try {
      const { username, email, password } = body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return { status: 400, body: { success: false, message: "User already exists" } };
      }

      const hashedPassword = await Bun.password.hash(password);

      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      return { 
        status: 201, 
        body: {
          success: true,
          message: "User created successfully", 
          user: { 
            id: newUser._id, 
            username: newUser.username, 
            email: newUser.email, 
            role: newUser.role,
            imgUrl: newUser.imgUrl 
          } 
        }
      };
    } catch (err: any) {
      return { status: 500, body: { success: false, message: "Error registering user", error: err.message } };
    }
  },

  async login(body: { email: string; password: string }, jwtSign: (payload: any) => Promise<string>) {
    try {
      const { email, password } = body;

      const user = await User.findOne({ email });
      if (!user) {
        return { status: 401, body: { success: false, message: "Invalid email or password" } };
      }

      const isMatch = await Bun.password.verify(password, user.password);
      if (!isMatch) {
        return { status: 401, body: { success: false, message: "Invalid email or password" } };
      }

      const token = await jwtSign({ 
        id: user._id, 
        role: user.role 
      });

      return {
        status: 200,
        body: {
          success: true,
          message: "Login successful",
          token,
          user: { 
            id: user._id, 
            username: user.username, 
            email: user.email, 
            role: user.role,
            imgUrl: user.imgUrl 
          }
        }
      };
    } catch (err: any) {
      return { status: 500, body: { success: false, message: "Error logging in", error: err.message } };
    }
  }
};
