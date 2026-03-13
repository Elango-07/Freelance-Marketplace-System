import cloudinary from '../config/cloudinary.js';
import { supabase } from '../config/supabase.js';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Convert buffer to base64 for Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    let result;
    if (process.env.CLOUDINARY_API_KEY && !process.env.CLOUDINARY_API_KEY.includes('YOUR_')) {
      result = await cloudinary.uploader.upload(dataURI, {
        folder: 'fms_projects',
        resource_type: 'auto'
      });
    } else {
      // SIMULATION MODE
      console.log('--- CLOUDINARY SIMULATION MODE ---');
      result = {
        secure_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
        public_id: `sim_file_${Date.now()}`,
        format: 'jpg',
        bytes: req.file.size
      };
    }

    res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      size: result.bytes,
      isSimulated: !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY.includes('YOUR_')
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.body;
    await cloudinary.uploader.destroy(publicId);
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
};
