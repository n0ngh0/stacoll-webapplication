import Language from "../models/Language";

export const languageController = {
  async getAllLanguages() {
    try {
      const languages = await Language.find({ isActive: true }).sort({ name: 1 }).lean();
      return {
        status: 200,
        body: { success: true, languages },
      };
    } catch (err: any) {
      return {
        status: 500,
        body: { success: false, message: "Error fetching languages", error: err.message },
      };
    }
  }
};
