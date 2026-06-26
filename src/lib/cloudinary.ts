// This function uploads an image file to Cloudinary and returns the URL
export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable is not defined.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "portfolio_uploads"); // your preset name
  formData.append("cloud_name", cloudName);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
    throw new Error(errorData.error?.message || "Failed to upload image to Cloudinary.");
  }

  const data = await response.json();
  return data.secure_url; // This is the image URL to store in Supabase
}
