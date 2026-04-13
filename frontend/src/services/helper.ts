import dayjs from "dayjs";

export const FORMATE_DATE_DEFAULT = "YYYY-MM-DD";
export const FORMATE_DATE_VN = "DD-MM-YYYY";
export const MAX_UPLOAD_IMAGE_SIZE = 2; //2MB

export const dateRangeValidate = (dateRange: any) => {
    if (!dateRange) return undefined;

    const startDate = dayjs(dateRange[0], FORMATE_DATE_DEFAULT).toDate();
    const endDate = dayjs(dateRange[1], FORMATE_DATE_DEFAULT).toDate();

    return [startDate, endDate];
};

const FOOD_IMAGE_BUCKET_URL = (import.meta.env.VITE_FOOD_IMAGE_BUCKET_URL as string | undefined)
    || "https://food-service-images.s3.ap-southeast-1.amazonaws.com/meals";

export const resolveFoodImageUrl = (imageValue?: string | null) => {
    if (!imageValue) return "/default-food.png";

    if (/^https?:\/\//i.test(imageValue)) {
        return imageValue;
    }

    const normalized = imageValue.replace(/^\/+/, "");
    const key = normalized.startsWith("meals/") ? normalized.slice(6) : normalized;
    return `${FOOD_IMAGE_BUCKET_URL}/${key}`;
};

export const normalizeRole = (role?: string | null) => {
    if (!role) return "USER";
    return role.replace(/^ROLE_/, "").toUpperCase();
};

export const isAdminRole = (role?: string | null) => normalizeRole(role) === "ADMIN";