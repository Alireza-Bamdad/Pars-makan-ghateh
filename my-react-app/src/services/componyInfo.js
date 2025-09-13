//services/utils.js
import { api } from './api';



// =====================
// COMPANY INFO MANAGEMENT
// =====================

// Get company info (public)
export const getCompanyInfo = async () => {
  const { data } = await api.get("/company-info");
  return data;
};

// Get public company info (without sensitive data)
export const getPublicCompanyInfo = async () => {
  const { data } = await api.get("/company-info/public");
  return data;
};

// Get theme colors
export const getThemeColors = async () => {
  const { data } = await api.get("/company-info/theme");
  return data;
};

// Get admin summary of company info
export const getCompanyInfoSummary = async () => {
  const { data } = await api.get("/company-info/admin/summary");
  return data;
};

// Update complete company info (admin)
export const updateCompanyInfo = async (companyData) => {
  const { data } = await api.put("/company-info", companyData);
  return data;
};

// Update contact info (admin)
export const updateContactInfo = async (contactData) => {
  const { data } = await api.patch("/company-info/contact", contactData);
  return data;
};

// Update social media (admin)
export const updateSocialMedia = async (socialData) => {
  const { data } = await api.patch("/company-info/social-media", socialData);
  return data;
};

// Update website texts (admin)
export const updateWebsiteTexts = async (textsData) => {
  const { data } = await api.patch("/company-info/texts", textsData);
  return data;
};

// Update SEO settings (admin)
export const updateSeoSettings = async (seoData) => {
  const { data } = await api.patch("/company-info/seo", seoData);
  return data;
};

// Update display settings (admin)
export const updateDisplaySettings = async (settingsData) => {
  const { data } = await api.patch("/company-info/settings", settingsData);
  return data;
};

// Upload logo (admin)
export const uploadLogo = async (logoFile) => {
  const formData = new FormData();
  formData.append('logo', logoFile);
  
  const { data } = await api.post("/company-info/upload/logo", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

// Upload favicon (admin)
export const uploadFavicon = async (faviconFile) => {
  const formData = new FormData();
  formData.append('favicon', faviconFile);
  
  const { data } = await api.post("/company-info/upload/favicon", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

// Upload hero image (admin)
export const uploadHeroImage = async (heroFile) => {
  const formData = new FormData();
  formData.append('heroImage', heroFile);
  
  const { data } = await api.post("/company-info/upload/hero-image", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};
