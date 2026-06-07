import type { OrderStatus } from "./types";

export const t = {
  // Layout & nav
  appTitle: "Нэгдүгээр цуглаан",
  appSubtitle: "Эзэний өдрийн Кафе",
  navMenu: "Цэс",
  navCart: "Сагс",
  cartConfirmHint: "Энд дарж захиалгаа баталгаажуулна уу.",
  nameConfirmHint: "Нэрээ оруулна уу.",
  navHome: "Нүүр",
  navAdmin: "Админ",
  search: "Хайх",
  close: "Хаах",
  copy: "Хуулах",
  copied: "Хуулсан",

  // Home
  homeTitle: "Нэгдүгээр цуглаан",
  homeTagline: "Эзэний өдрийн Кафе",
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
  goToCart: "Сагс руу",
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
  yourOrderNumberLabel: "Таны захиалгын дугаар",
  orderPlacedHint:
    "Таны захиалгыг гал тогоо руу илгээлээ. Удахгүй бэлэн болно.",
  backToMenu: "Цэс рүү буцах",

  // API / errors
  apiUnreachable:
    "Серверт холбогдож чадсангүй — холболтоо шалгаад дахин оролдоно уу.",
  requestFailed: "Хүсэлт амжилтгүй боллоо",
  categoryNotFound: "Ангилал олдсонгүй. Хуудсыг шинэчлээд дахин оролдоно уу.",
  dishNotFound: "Хоол олдсонгүй. Хуудсыг шинэчлээд дахин оролдоно уу.",
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
  deleteOrder: "Устгах",
  deleteOrderLabel: (orderNumber: number) => `Захиалга ${orderNumber} устгах`,
  failedDeleteOrder: "Захиалга устгаж чадсангүй",
  registerOrder: "Захиалга бүртгэх",
  registerOrderTitle: "Гар захиалга бүртгэх",
  registerOrderHint:
    "Мөр бүрт нэр, хоол, тоо оруулна. Мөр бүр тусдаа захиалга. Enter дарж хадгална.",
  registerOrderDialogHint: "Нэг хүний нэр, доор нь хоол бүрт тоо оруулна.",
  addDishToOrder: "Хоол нэмэх",
  orderItems: "Захиалгын жагсаалт",
  back: "Буцах",
  registerShortcutKey: "Shift+F",
  consumerName: "Хэрэглэгчийн нэр",
  consumerNamePlaceholder: "Жишээ нь: Дэнни",
  pressEnterToSave: "Enter дарж хадгалах",
  customerNameRequired: "Хэрэглэгчийн нэрийг оруулна уу",
  ordersCreated: (count: number) => `${count} захиалга бүртгэгдлээ`,
  registerOrderSuccess: "Захиалга амжилттай бүртгэгдлээ",
  registerOrderFailed: "Захиалга бүртгэж чадсангүй",
  addRow: "Мөр нэмэх",
  clearRows: "Цэвэрлэх",
  rowNumber: "#",
  colCustomerName: "Нэр",
  colDish: "Хоол",
  ordersToRegister: "Бүртгэх захиалга",
  registerRowRequired: "Дор хаяж нэг мөр бөглөнө үү (нэр, хоол, тоо)",
  completeRowRequired: "Бөглөсөн мөрөнд нэр, хоол, тоо бүгд шаардлагатай",
  colQuantity: "Тоо",
  colUnitPrice: "Үнэ",
  colSubtotal: "Дүн",
  colActions: "",
  dishSearchPlaceholder: "Хоол хайх...",
  noDishMatches: "Хоол олдсонгүй",
  selectDishFirst: "Эхлээд хоол сонгоно уу",
  registerSubmit: "Захиалга хадгалах",
  registering: "Хадгалж байна...",
  goToOrderBoard: "Захиалгын самбар руу",
  totalRows: (count: number) => `${count} мөр`,

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
  dishesHint: "Цэсний зүйлсийг нэмж, засаж, удирдах",
  dishName: "Нэр",
  dishCategory: "Ангилал",
  selectCategory: "Ангилал сонгох",
  dishPrice: "Үнэ (₮)",
  dishDescription: "Тайлбар",
  dishImage: "Зураг",
  dishImages: "Зургууд",
  dishImagesCount: "зураг",
  addDishImage: "Зураг нэмэх",
  removeDishImage: "Зураг хасах",
  uploading: "Байршуулж байна...",
  imageUploadFailed: "Зураг байршуулж чадсангүй. Дахин оролдоно уу.",
  unsupportedImageType:
    "Зөвхөн JPG, PNG, WebP, GIF зураг оруулна уу. iPhone HEIC зургийг эхлээд JPG болгон хөрвүүлнэ үү.",
  imageUploaded: "Зураг байршлаа ✓",
  uploadDishImage: "Хоолын зураг байршуулах",
  addDish: "Хоол нэмэх",
  editDish: "Засах",
  saveDish: "Хадгалах",
  cancelEdit: "Болих",
  editingDish: "Хоол засах",
  failedUpdateDish: "Хоол хадгалж чадсангүй",
  deleteDishLabel: (name: string) => `${name} устгах`,
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
  if (message === "Dish not found") return t.dishNotFound;
  if (message === "Invalid credentials") return t.loginFailed;
  if (message === "Customer name is required") return t.customerNameRequired;
  if (message === "Order not found") return t.failedDeleteOrder;
  if (status >= 500) return t.serverError;
  return message;
}
