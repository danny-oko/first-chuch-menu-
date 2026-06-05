import type { OrderStatus } from "./types";

export const t = {
  // Layout & nav
  appTitle: "Амттай цэс",
  appSubtitle: "Шинэ, эрүүл хоол",
  navMenu: "Цэс",
  navCart: "Сагс",
  navHome: "Нүүр",
  navAdmin: "Админ",
  search: "Хайх",
  close: "Хаах",
  copy: "Хуулах",
  copied: "Хуулсан",

  // Home
  delicious: "Амттай",
  food: "хоол",
  homeTagline: "Бид шинэ, эрүүл хоол бэлтгэдэг",
  itemsAvailable: (count: number) => `${count} зүйл байна`,
  categoryAll: "Бүгд",
  noDishesYet: "Одоогоор хоол байхгүй байна.",
  noDishesInCategory: "Энэ ангилалд хоол байхгүй байна.",
  featured: "Онцлох",

  // Dish detail
  special: "Онцлох",
  defaultDishDescription:
    "Манай тусгай жороор бэлтгэсэн шинэ, эрүүл хоол. Жингээ хасахыг хүсэгчдэд тохиромжтой.",
  deliveryTime: "Хүргэх хугацаа",
  deliveryMins: "25 мин",
  totalPrice: "Нийт үнэ",
  addToCart: "Сагсанд нэмэх",
  goBack: "Буцах",
  moreOptions: "Бусад",
  decreaseQty: "Тоо хасах",
  increaseQty: "Тоо нэмэх",
  addDishToCart: (name: string) => `${name} сагсанд нэмэх`,
  inCart: (quantity: number) => `Сагсанд ${quantity} байна`,

  // Cart
  yourCart: "Таны сагс",
  item: "зүйл",
  items: "зүйл",
  cartEmpty: "Таны сагс хоосон байна",
  browseMenu: "Цэс үзэх",
  removeFromCart: (name: string) => `${name} сагсаас хасах`,
  orderSummary: "Захиалгын дүн",
  total: "Нийт",
  placeOrder: "Захиалга өгөх",
  continueShopping: "Үргэлжлүүлэн худалдан авах",
  checkoutFailed: "Захиалга амжилтгүй боллоо",

  // Order confirm modal
  confirmOrderTitle: "Захиалга баталгаажуулах",
  confirmOrderHint:
    "Эхлээд доорх данс руу шилжүүлэг хийж, дараа нь захиалга илгээнэ үү.",
  yourName: "Таны нэр",
  namePlaceholder: "Жишээ нь: Дэнни",
  accountNumber: "Дансны дугаар",
  transferNote: "Гүйлгээний утга",
  totalAmount: "Нийт дүн",
  submitting: "Илгээж байна...",
  submitOrder: "Захиалга илгээх",
  cancel: "Болих",
  namePlaceholderShort: "Таны нэр",

  // Checkout success
  orderPlaced: "Захиалга амжилттай!",
  orderPlacedHint:
    "Таны захиалгыг гал тогоо руу илгээлээ. Удахгүй бэлэн болно.",
  backToMenu: "Цэс рүү буцах",

  // API / errors
  apiUnreachable:
    "Серверт холбогдож чадсангүй — холболтоо шалгаад дахин оролдоно уу.",
  requestFailed: "Хүсэлт амжилтгүй боллоо",
  categoryNotFound: "Ангилал олдсонгүй. Хуудсыг шинэчлээд дахин оролдоно уу.",
  categoryDeleteBlocked:
    "Энэ ангиллыг устгах боломжгүй — өмнөх захиалгад орсон хоол агуулсан байна.",
  dishDeleteBlocked:
    "Энэ хоолыг устгах боломжгүй — өмнөх захиалгад орсон байна.",
  serverError: "Серверийн алдаа. Дараа дахин оролдоно уу.",

  // Admin shell
  adminPanel: "Админ самбар",
  goToClient: "Клиент хуудас руу",
  logout: "Гарах",
  navOrders: "Захиалга",
  navDishes: "Хоол",
  navCategories: "Ангилал",

  // Admin login
  adminLogin: "Админ нэвтрэх",
  adminLoginHint: "Цэс болон захиалгыг удирдахын тулд нэвтэрнэ үү",
  username: "Хэрэглэгчийн нэр",
  password: "Нууц үг",
  signingIn: "Нэвтэрч байна...",
  signIn: "Нэвтрэх",
  loginFailed: "Нэвтрэх амжилтгүй боллоо",

  // Admin orders
  orderBoard: "Захиалгын самбар",
  activeOrders: (count: number) =>
    `${count} идэвхтэй захиалга · Бодит цагийн синк идэвхтэй`,
  newOrderReceived: "Шинэ захиалга ирлээ!",
  noOrders: "Захиалга байхгүй",
  recentlyCompleted: "Саяхан дууссан",
  acceptOrder: "Зөвшөөрөх",
  completeOrder: "Дуусгах",

  // Admin categories
  categoriesTitle: "Ангилал",
  categoriesHint: "Цэсний ангиллуудыг удирдах",
  categoryName: "Ангиллын нэр",
  newCategoryPlaceholder: "Шинэ ангиллын нэр",
  add: "Нэмэх",
  deleteCategory: (name: string) => `${name} устгах`,
  failedAddCategory: "Ангилал нэмж чадсангүй",
  failedDeleteCategory: "Ангилал устгаж чадсангүй",

  // Admin dishes
  dishesTitle: "Хоол",
  dishesHint: "Цэсний зүйлсийг нэмж, удирдах",
  dishName: "Нэр",
  dishCategory: "Ангилал",
  selectCategory: "Ангилал сонгох",
  dishPrice: "Үнэ (₮)",
  dishDescription: "Тайлбар",
  dishImage: "Зураг",
  uploading: "Байршуулж байна...",
  imageUploaded: "Зураг байршлаа ✓",
  uploadDishImage: "Хоолын зураг байршуулах",
  addDish: "Хоол нэмэх",
  failedDeleteDish: "Хоол устгаж чадсангүй",
} as const;

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending: "Хүлээгдэж буй",
  preparing: "Бэлтгэж байна",
  completed: "Дууссан",
  cancelled: "Цуцлагдсан",
};

export function formatApiErrorMessage(message: string, status: number): string {
  if (message === "Category not found") return t.categoryNotFound;
  if (
    message ===
    "Cannot delete category: dishes in this category have order history"
  ) {
    return t.categoryDeleteBlocked;
  }
  if (message === "Cannot delete dish: it exists in past orders") {
    return t.dishDeleteBlocked;
  }
  if (message === "Invalid credentials") return t.loginFailed;
  if (status >= 500) return t.serverError;
  return message;
}
