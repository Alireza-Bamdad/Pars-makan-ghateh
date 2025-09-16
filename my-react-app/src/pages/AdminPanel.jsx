import { useState } from "react";
import ProductList from "../components/Products/ProductManagement";
import CategoryManagement from "../components/Categories/CategoryManagement";
// import CompanyInfo from "./components/Company/CompanyInfo";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab("products")} 
          className={activeTab === "products" ? "font-bold" : ""}
        >
          مدیریت محصولات
        </button>
        <button 
          onClick={() => setActiveTab("categories")} 
          className={activeTab === "categories" ? "font-bold" : ""}
        >
          مدیریت دسته‌بندی
        </button>
        {/* <button 
          onClick={() => setActiveTab("company")} 
          className={activeTab === "company" ? "font-bold" : ""}
        >
          مدیریت اطلاعات شرکت
        </button> */}
      </div>

      {/* Content */}
      {activeTab === "products" && <ProductList />}
      {activeTab === "categories" && <CategoryManagement />}
      {/* {activeTab === "company" && <CompanyInfo />} */}
    </div>
  );
}
