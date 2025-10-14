"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  User,
  Building,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Home,
  Truck,
  Briefcase,
  DollarSign,
  FileText,
  Layers,
  PackageCheck,
  Box,
} from "lucide-react";
import { storage } from "../lib/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { Image as ImageIcon } from "lucide-react";
import { TrendingUp, Users, Package, Award } from "lucide-react";

export default function App() {
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    panNumber: "",
    aadharNumber: "",
    gstNumber: "",
    businessType: "",
    shopLicense: "",
    fssaiLicense: "",
    productCategories: "",
    experienceYears: "",
    brandsAssociated: [],
    warehouseDetails: "",
    territoryInterested: "",
    retailersCovered: "",
    interestedCategories: [],
    deliveryVehicles: "",
    vehicleCount: "",
    investmentCapacity: "",
    otp: "",
    referenceId: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReferenceScreen, setShowReferenceScreen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [referenceSubmitted, setReferenceSubmitted] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Handle file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  // Delete an image before upload
  const handleRemoveImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.companyName.trim())
      newErrors.companyName = "Company name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.businessType.trim())
      newErrors.businessType = "Business type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  // add category functions
  const handleAddCategory = () => {
    if (newCategory.trim() && formData.interestedCategories.length < 5) {
      setFormData((prev) => ({
        ...prev,
        interestedCategories: [
          ...prev.interestedCategories,
          newCategory.trim(),
        ],
      }));
      setNewCategory("");
    }
  };
  // remove category function
  const handleRemoveCategory = (index) => {
    setFormData((prev) => ({
      ...prev,
      interestedCategories: prev.interestedCategories.filter(
        (_, i) => i !== index
      ),
    }));
  };
  // add brand functions and remove brand function
  const handleAddBrand = () => {
    if (newBrand.trim() && formData.brandsAssociated.length < 5) {
      setFormData({
        ...formData,
        brandsAssociated: [...formData.brandsAssociated, newBrand.trim()],
      });
      setNewBrand(""); // reset input
    }
  };

  const handleRemoveBrand = (index) => {
    setFormData({
      ...formData,
      brandsAssociated: formData.brandsAssociated.filter((_, i) => i !== index),
    });
  };

  // Send OTP
  const handleSendVerification = async () => {
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setOtpLoading(true);

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (data.success) {
        setVerificationSent(true);
        setNotificationMessage("OTP sent to your email!");
        setNotificationType("success");
        setTimeout(() => setNotificationMessage(""), 3000);
      } else {
        setNotificationMessage(data.error || "Failed to send OTP.");
        setNotificationType("error");
      }
    } catch (err) {
      setNotificationMessage("Failed to send OTP. Try again.");
      setNotificationType("error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (resendTimer === 0) {
      handleSendVerification();
      setResendTimer(30);
    }
  };

  // Verify OTP
  const handleVerifyEmail = async () => {
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });
      const data = await res.json();
      if (data.success) {
        setIsVerified(true);
        setVerificationSent(false);
        setFormData((prev) => ({ ...prev, otp: "" }));
        setNotificationMessage("Email verified successfully!");
        setNotificationType("success");
        setTimeout(() => setNotificationMessage(""), 3000);
      } else {
        alert(data.error);
      }
    } catch (err) {
      setNotificationMessage(data.error || "OTP verification failed.");
      setNotificationType("error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check email verification
    if (!isVerified) {
      setNotificationMessage("Please verify your email before submitting!");
      setNotificationType("error");
      setTimeout(() => setNotificationMessage(""), 3000);
      return;
    }

    // Validate form fields
    const isValid = validateForm();
    if (!isValid) {
      const firstErrorField = document.querySelector(
        `[name="${Object.keys(errors)[0]}"]`
      );
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorField.focus();
      }

      setNotificationMessage(
        "Please fill all mandatory fields highlighted in red."
      );
      setNotificationType("error");
      setTimeout(() => setNotificationMessage(""), 4000);

      return;
    }

    setIsSubmitting(true);

    try {
      // Save main form data
      const res = await fetch("/api/save-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        // Save docId for reference
        setFormData((prev) => ({ ...prev, docId: data.docId }));

        // Upload selected images to Firebase Storage in parallel
        if (selectedImages.length > 0) {
          const uploadedUrls = await Promise.all(
            selectedImages.map(async (file) => {
              const storageRef = ref(
                storage,
                `distributors/${data.docId}/${file.name}`
              );
              await uploadBytes(storageRef, file);
              return getDownloadURL(storageRef);
            })
          );

          // Save URLs to Firestore under distributor document
          await fetch("/api/save-images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ docId: data.docId, images: uploadedUrls }),
          });
        }

        // Show QR code for payment
        setTimeout(() => {
          setShowQRCode(true);
          setSuccessMessage("");
        }, 1500);

        // Reset verification flags
        setIsVerified(false);
        setVerificationSent(false);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentComplete = () => {
    setShowQRCode(false);
    setShowReferenceScreen(true);
  };

  const handleReferenceSubmit = async () => {
    if (!formData.referenceId?.trim()) {
      setNotificationMessage("Please enter a valid reference ID");
      setNotificationType("error");
      return;
    }

    try {
      const res = await fetch("/api/verify-reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docId: formData.docId,
          referenceId: formData.referenceId,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setNotificationMessage(
          "Your reference ID has been submitted successfully. We will manually verify it and reach out to you."
        );
        setNotificationType("success");

        setTimeout(() => {
          setShowReferenceScreen(false);
          setFormData({
            fullName: "",
            companyName: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            country: "",
            panNumber: "",
            aadharNumber: "",
            gstNumber: "",
            businessType: "",
            shopLicense: "",
            fssaiLicense: "",
            productCategories: "",
            experienceYears: "",
            brandsAssociated: [],
            warehouseDetails: "",
            territoryInterested: "",
            retailersCovered: "",
            interestedCategories: [],
            deliveryVehicles: "",
            vehicleCount: "",
            investmentCapacity: "",
            otp: "",
            referenceId: "",
            docId: "",
          });
          //
          setSelectedImages([]);
          setImagePreviews([]);

          setSuccessMessage("");
          setNotificationMessage("");
          setIsVerified(false);
          setVerificationSent(false);
        }, 4000);
      } else {
        setNotificationMessage(data.error || "Failed to submit reference");
        setNotificationType("error");
      }
    } catch (err) {
      console.error(err);
      setNotificationMessage("Failed to submit reference");
      setNotificationType("error");
    }
  };

  // Reference ID Screen
  if (showReferenceScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Company Logo"
                className="mx-auto w-100 mb-4 object-contain"
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Enter Payment Reference
            </h2>
            <p className="text-gray-600">
              Please enter your UPI Reference ID or Transaction Number
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              UPI Reference ID / Transaction Number *
            </label>
            <input
              type="text"
              name="referenceId"
              value={formData.referenceId}
              onChange={handleInputChange}
              className="w-full px-2 py-1 border text-black rounded-xl border-gray-300  focus:border-transparent"
              placeholder="Enter Reference ID or Transaction Number"
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter the reference number you received after completing the UPI
              payment
            </p>
          </div>

          {notificationMessage && (
            <div
              className={`mb-6 p-4 rounded-xl text-center font-medium ${
                notificationType === "success"
                  ? "bg-green-100 border border-green-300 text-green-800"
                  : "bg-red-100 border border-red-300 text-red-800"
              }`}
            >
              {notificationMessage}
            </div>
          )}

          <button
            onClick={handleReferenceSubmit}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 cursor-pointer rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
          >
            Submit Reference ID
          </button>
        </div>
      </div>
    );
  }

  if (showQRCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          {/* Logo in Payment Screen */}
          <div className="text-center mb-4">
            <div className=" flex items-center justify-center ">
              <img
                src="/logo.png"
                alt="Company Logo"
                className="mx-auto w-100 mb-4  object-contain"
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Payment Required
            </h2>
            <p className="text-gray-600">
              Scan the QR code below to complete your payment
            </p>
          </div>

          <div className="bg-gray-100 rounded-xl p-6 mb-6 flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <div className="w-60 h-60 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <img
                    src="/payment-qr.jpg"
                    alt="Company Logo"
                    className="mx-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-4">
              Please scan the QR code with any UPI app to pay for your order.
              After payment, enter the UPI Reference ID or Transaction Number
              (e.g. 401422121258) on the next screen. We’ll manually verify your
              payment using the provided information.
            </p>
            <p className="font-semibold text-gray-800">{formData.email}</p>
          </div>

          <button
            onClick={handlePaymentComplete}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 cursor-pointer rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
          >
            I have Completed Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff] py-12 px-4">
      <div className="">
        {/* Header with Logo - Fixed */}
        <div className="fixed top-0 left-0 w-full bg-white shadow-lg z-50 flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-4">
          {/* Logo on the left */}
          <div className="flex items-center justify-center md:justify-start w-full md:w-auto mb-2 md:mb-0">
            <img
              src="/logo.png"
              alt="Company Logo"
              className="w-40 sm:w-52 md:w-65 h-auto object-contain"
            />
          </div>

          {/* Phone number on the right */}
          <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg">
            <Phone className="w-4 sm:w-5 h-4 sm:h-5 text-[#FE681C]" />
            <h1 className="text-[#282252] font-bold text-sm sm:text-base md:text-lg">
              +91 98275 19707
            </h1>
          </div>
        </div>

        {/* LEFT SIDE - Graphics / Company Info */}
        <div className="min-h-screen bg-gray-50 flex justify-center items-start py-10">
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="hidden md:flex md:col-span-5 flex-col justify-between w-full rounded-2xl shadow-2xl text-black relative overflow-hidden">
              {/* SECTION 1 - Header with Orange Background */}
              <div className="relative h-1/4 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full -mr-16 -mt-16"></div>
                {/* Clouds */}
                <div className="absolute top-23 left-12 w-32 h-20 opacity-40">
                  <div className="absolute bg-[#FE681C] rounded-full w-16 h-16 top-2 left-0"></div>
                  <div className="absolute bg-[#FE681C] rounded-full w-20 h-20 top-0 left-8"></div>
                  <div className="absolute bg-[#FE681C] rounded-full w-18 h-14 top-4 left-16"></div>
                </div>

                <div className="absolute top-20 right-16 w-40 h-24 opacity-40">
                  <div className="absolute bg-[#FE681C] rounded-full w-20 h-20 top-2 left-0"></div>
                  <div className="absolute bg-[#FE681C] rounded-full w-24 h-24 top-0 left-12"></div>
                  <div className="absolute bg-[#FE681C] rounded-full w-18 h-18 top-4 left-24"></div>
                </div>

                {/* Stars */}
                <div className="absolute top-30 left-28 text-[#fb5e10] text-2xl opacity-60">
                  ✦
                </div>
                <div className="absolute top-32 right-32 text-[#fb5e10] text-3xl opacity-70">
                  ✦
                </div>
                <div className="absolute top-12 right-24 text-[#fb5e10] text-xl opacity-50">
                  ✦
                </div>

                {/* Content */}
                <div className="relative z-10 px-8 pt-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-1.5 rounded-lg shadow-lg mt-1">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-[#FE681C] font-bold text-xl tracking-tight">
                        India’s Largest Distributor Network
                      </h1>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="h-1 w-1 rounded-full bg-white/80"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 px-8 pb-6">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-orange-200">
                    <h2 className="text-[#FE681C] font-bold text-lg mb-1">
                      Distributor Onboarding
                    </h2>
                    <p className="text-black text-sm">
                      Your gateway to nationwide distribution success
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3 - Why Choose Us */}
              <div className="h-1/4 bg-gradient-to-b from-yellow-50 via-teal-50 to-cyan-50 flex items-center relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-200/30 rounded-full -ml-12 -mb-12"></div>

                <div className="absolute top-0 left-0 w-40 h-40 bg-emerald-200/20 rounded-full -ml-20 -mt-20"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-200/20 rounded-full -mr-16 -mb-16"></div>
                <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-emerald-400/40 rounded-full"></div>
                <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-teal-400/40 rounded-full"></div>

                <div className="relative z-10 px-8 py-6 w-full">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-lg shadow-lg mt-1">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-emerald-800 mb-2">
                        Why Partner With Us?
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 bg-white/60 rounded-lg p-2.5 border border-emerald-200/60">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 font-medium">
                        Priority connect with big brands.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 bg-white/60 rounded-lg p-2.5 border border-teal-200/60">
                      <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 font-medium">
                        Pan-India logistics support & timely delivery
                      </p>
                    </div>
                    <div className="flex items-start gap-3 bg-white/60 rounded-lg p-2.5 border border-cyan-200/60">
                      <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 font-medium">
                        Dedicated relationship manager for your business
                      </p>
                    </div>
                    <div className="flex items-start gap-3 bg-white/60 rounded-lg p-2.5 border border-cyan-200/60">
                      <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 font-medium">
                        Helping in negotiations assistance onboarding
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2 - Welcome Message */}
              <div className="h-1/4 bg-gradient-to-b from-cyan-50 via-amber-50 to-yellow-50 flex items-center relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-200/30 rounded-full -ml-12 -mb-12"></div>

                <div className="relative z-10 px-8 py-6 w-full">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-1.5 rounded-lg shadow-lg mt-1">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl text-[#FE681C] font-bold mb-2">
                        Join Our Network!
                      </h3>
                      <p className="text-gray-700 text-base leading-relaxed">
                        Become a part of India's fastest-growing distribution
                        network. Partner with us to unlock unlimited business
                        opportunities and scale your reach.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 bg-white/60 rounded-lg p-3 border border-orange-200">
                    <span className="text-2xl">🎯</span>
                    <p className="text-sm text-gray-700 font-medium">
                      Fill the form and our team will connect within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 4 - Stats & CTA */}
              <div className="h-1/4 bg-gradient-to-b from-yellow-50 via-indigo-50 to-purple-50 flex items-center relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-blue-200/20 rounded-full -mr-18 -mt-18"></div>
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-indigo-200/20 rounded-full -ml-14 -mb-14"></div>
                <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-blue-400/30 rounded-full"></div>
                <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-purple-400/30 rounded-full"></div>

                <div className="relative z-10 px-8 py-6 w-full">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg shadow-lg mt-1">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-blue-800 mb-1">
                        Our Distributor Network
                      </h4>
                      <p className="text-sm text-gray-600">
                        Growing stronger every day
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3.5 border border-blue-200/60 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="bg-blue-100 p-1.5 rounded-lg">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-900">
                          1.5 Lakhs+
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        Active Distributors
                      </p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3.5 border border-indigo-200/60 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="bg-indigo-100 p-1.5 rounded-lg">
                          <MapPin className="w-4 h-4 text-indigo-600" />
                        </div>
                        <p className="text-2xl font-bold text-indigo-900">
                          200+
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        Cities Covered
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-3 text-center">
                    <p className="text-sm text-white font-semibold">
                      🚀 Start your journey with India's most trusted platform!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Form */}
            <div className="md:col-span-7 w-full max-w-full mx-auto bg-white border border-gray-300 rounded-2xl shadow-xl overflow-hidden ">
              {successMessage && (
                <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-xl text-center font-medium">
                  {successMessage}
                </div>
              )}

              <div className="bg-[#f8f8f8] rounded-2xl p-8">
                {notificationMessage && (
                  <div
                    className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl text-center font-medium text-sm sm:text-base transition-all ${
                      notificationType === "success"
                        ? "bg-green-100 border border-green-300 text-green-800"
                        : "bg-red-100 border border-red-300 text-red-800"
                    }`}
                  >
                    {notificationMessage}
                  </div>
                )}

                <h2 className="text-2xl sm:text-3xl md:text-4xl text-[#FE681C] font-bold mb-6 text-center">
                  Distributor Registration Form
                </h2>

                <div className="space-y-6">
                  {/* Personal Information Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 text-black gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Full Name <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`w-full pl-10 px-2 py-1 text-black border  rounded-xl transition-all ${
                            errors.fullName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />{" "}
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Company Name <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-2 py-1 border text-black rounded-xl  focus:border-transparent transition-all ${
                            errors.companyName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter your company name"
                        />
                      </div>
                      {errors.companyName && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />{" "}
                          {errors.companyName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email with Verification */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Email Input + Verification */}
                    <div className="w-full">
                      <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-2">
                        Email Address <span className="text-red-600">*</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-2 sm:top-2.5 w-4 sm:w-5 h-4 sm:h-5 text-[#FE681C]" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-2 py-1 sm:py-1.5 border text-black rounded-xl transition-all ${
                              errors.email
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter your email"
                            disabled={verificationSent || isVerified}
                          />
                        </div>

                        {!isVerified ? (
                          <button
                            type="button"
                            onClick={handleSendVerification}
                            disabled={
                              !formData.email || otpLoading || verificationSent
                            }
                            className="bg-[#FE681C] text-white px-3 py-1 sm:py-1 rounded-xl font-semibold hover:bg-[#e67035] disabled:bg-[#FE681C] disabled:cursor-not-allowed cursor-pointer transition-all w-full sm:w-auto"
                          >
                            {otpLoading
                              ? "Sending..."
                              : verificationSent
                              ? "Sent!"
                              : "Verify Email"}
                          </button>
                        ) : (
                          <div className="flex items-center px-2 py-2 bg-green-100 rounded-xl w-full sm:w-auto">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-green-700 font-medium">
                              Verified
                            </span>
                          </div>
                        )}
                      </div>

                      {errors.email && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center">
                          <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />{" "}
                          {errors.email}
                        </p>
                      )}

                      {verificationSent && !isVerified && (
                        <div className="mt-3 space-y-2">
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <input
                              type="text"
                              name="otp"
                              value={formData.otp || ""}
                              onChange={handleInputChange}
                              placeholder="Enter OTP"
                              className="w-full sm:flex-1 px-2 py-1 border rounded-xl text-black"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyEmail}
                              className="bg-[#FF8C2F] text-white px-2 py-2 rounded-xl font-medium w-full sm:w-auto"
                            >
                              Verify
                            </button>
                          </div>

                          {/* Resend OTP */}
                          <div>
                            <button
                              type="button"
                              onClick={handleResendOTP}
                              disabled={resendTimer > 0}
                              className="text-blue-600 font-medium hover:underline disabled:text-gray-400 cursor-pointer text-sm sm:text-base"
                            >
                              {resendTimer > 0
                                ? `Resend OTP in ${resendTimer}s`
                                : "Resend OTP"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phone Input */}
                    <div className="w-full">
                      <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-2">
                        Phone Number <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2 sm:top-2.5 w-4 sm:w-5 h-4 sm:h-5 text-[#FE681C]" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-1 py-2 sm:py-1.5 border text-black rounded-xl transition-all ${
                            errors.phone ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center">
                          <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />{" "}
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        City <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-2 py-1 border text-black rounded-xl  focus:border-transparent transition-all ${
                            errors.city ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter your city"
                        />
                      </div>
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.city}
                        </p>
                      )}
                    </div>
                    {/* Address */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-2 py-1 border text-black rounded-xl  focus:border-transparent transition-all ${
                            errors.address
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter your full address"
                        />
                      </div>
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />{" "}
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PAN Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        PAN Number
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                        <input
                          type="text"
                          name="panNumber"
                          value={formData.panNumber}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-2 py-1 border text-black rounded-xl  focus:border-transparent transition-all ${
                            errors.panNumber
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter your PAN number"
                        />
                      </div>
                      {errors.panNumber && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />{" "}
                          {errors.panNumber}
                        </p>
                      )}
                    </div>

                    {/* Aadhar Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Aadhar Number
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                        <input
                          type="text"
                          name="aadharNumber"
                          value={formData.aadharNumber}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-2 py-1 border text-black rounded-xl  focus:border-transparent transition-all ${
                            errors.aadharNumber
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter your Aadhar number"
                        />
                      </div>
                      {errors.aadharNumber && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />{" "}
                          {errors.aadharNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* GST Number */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        GST Number
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                        <input
                          type="text"
                          name="gstNumber"
                          value={formData.gstNumber}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-2 py-1 border text-black rounded-xl border-gray-300 focus:border-transparent"
                          placeholder="Enter your GST number"
                        />
                      </div>
                    </div>

                    {/* Business Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Current Business <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Layers className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                        <select
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-2 py-2 border text-black rounded-xl  focus:border-transparent ${
                            errors.businessType
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select</option>
                          <option value="Distributor">Distributor</option>
                          <option value="Dealer">Dealer</option>
                          <option value="Wholesaler">Wholesaler</option>
                          <option value="Fresher">Fresher</option>
                        </select>
                      </div>
                      {errors.businessType && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />{" "}
                          {errors.businessType}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shop & Establishment License and FSSAI License */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Shop & Establishment License (If Applicable)
                      </label>
                      <div className="relative">
                        <Truck className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                        <input
                          type="text"
                          name="shopLicense"
                          value={formData.shopLicense}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-2 py-1 border text-black rounded-xl border-gray-300  focus:border-transparent"
                          placeholder="Enter License number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        FSSAI License (If Applicable)
                      </label>
                      <div className="relative">
                        <PackageCheck className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                        <input
                          type="text"
                          name="fssaiLicense"
                          value={formData.fssaiLicense}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-2 py-1 border text-black rounded-xl border-gray-300  focus:border-transparent"
                          placeholder="Enter FSSAI number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Categories and Experience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Current Product Categories Handled
                      </label>
                      <div className="relative">
                        <Layers className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                        <input
                          type="text"
                          name="productCategories"
                          value={formData.productCategories}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-2 py-1 border text-black rounded-xl border-gray-300  focus:border-transparent"
                          placeholder="Enter categories"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Experience in Distribution (Years)
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                        <input
                          type="number"
                          name="experienceYears"
                          value={formData.experienceYears}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-2 py-1 border text-black rounded-xl border-gray-300  focus:border-transparent"
                          placeholder="Enter number of years"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Brands Associated and Warehouse Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Existing Brands Associated With */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Existing Brands Associated With (Upto 5)
                      </label>
                      <div className="flex gap-2">
                        {/* Input with icon */}
                        <div className="relative flex-1 min-w-[150px] max-w-[250px]">
                          <PackageCheck className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                          <input
                            type="text"
                            value={newBrand}
                            onChange={(e) => setNewBrand(e.target.value)}
                            className="w-full pl-10 px-2 py-2 sm:py-1.5 border text-black rounded-xl border-gray-300 focus:border-transparent transition-all"
                            placeholder="Enter brand name"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddBrand}
                          disabled={
                            !newBrand.trim() ||
                            formData.brandsAssociated.length >= 5
                          }
                          className="w-15 sm:w-auto px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-[#FE681C] transition-all"
                        >
                          +
                        </button>
                      </div>

                      {/* Show added brands */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.brandsAssociated.map((brand, index) => (
                          <span
                            key={index}
                            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm md:text-base break-words"
                          >
                            <span className="truncate max-w-[100px] sm:max-w-[150px]">
                              {brand}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBrand(index)}
                              className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-300 rounded-full px-1 sm:px-2"
                              aria-label={`Remove ${brand}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Warehouse / Godown Size & Location
                      </label>
                      <div className="relative">
                        <Box className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                        <input
                          type="text"
                          name="warehouseDetails"
                          value={formData.warehouseDetails}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-2 py-1 border text-black rounded-xl border-gray-300  focus:border-transparent"
                          placeholder="Enter details"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Territory and Retailers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Area / Territory Interested
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                        <input
                          type="text"
                          name="territoryInterested"
                          value={formData.territoryInterested}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-2 py-1 border text-black rounded-xl border-gray-300  focus:border-transparent"
                          placeholder="Enter area or territory"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        No. of Retailers / Wholesellers Covered
                      </label>
                      <div className="relative">
                        <Truck className="absolute left-3 top-2 w-5 h-5 text-[#FE681C]" />
                        <input
                          type="number"
                          name="retailersCovered"
                          value={formData.retailersCovered}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-2 py-1 border text-black rounded-xl border-gray-300  focus:border-transparent"
                          placeholder="Enter numbers"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interested Category */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Interested Categories */}
                    <div className="w-full">
                      <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-2">
                        Interested In Product / Category (Upto 5)
                      </label>
                      <div className="flex  gap-2 ">
                        <div className="relative flex-1 min-w-[150px] max-w-[250px]">
                          <Package className="absolute left-3 top-2 sm:top-2.5 w-4 sm:w-5 h-4 sm:h-5 text-[#FE681C]" />
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full pl-10 px-2 py-2 sm:py-1.5 border text-black rounded-xl border-gray-300 focus:border-transparent transition-all"
                            placeholder="Enter product"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          disabled={
                            !newCategory.trim() ||
                            formData.interestedCategories.length >= 5
                          }
                          className="w-15 sm:w-auto px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-[#FE681C] transition-all"
                        >
                          +
                        </button>
                      </div>
                      {/* Show selected categories */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.interestedCategories.map((cat, index) => (
                          <span
                            key={index}
                            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm md:text-base break-words"
                          >
                            <span className="truncate max-w-[100px] sm:max-w-[150px]">
                              {cat}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(index)}
                              className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-300 rounded-full px-1 sm:px-2"
                              aria-label={`Remove ${cat}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Vehicles */}
                    <div className="w-full mt-4 md:mt-0">
                      <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-2">
                        Delivery Vehicles
                      </label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <label className="flex items-center text-gray-900 gap-2">
                          <input
                            type="radio"
                            name="deliveryVehicles"
                            value="No"
                            checked={formData.deliveryVehicles === "No"}
                            onChange={handleInputChange}
                          />
                          No
                        </label>
                        <label className="flex items-center text-gray-900 gap-2">
                          <input
                            type="radio"
                            name="deliveryVehicles"
                            value="Yes"
                            checked={formData.deliveryVehicles === "Yes"}
                            onChange={handleInputChange}
                          />
                          Yes
                        </label>

                        {formData.deliveryVehicles === "Yes" && (
                          <input
                            type="number"
                            name="vehicleCount"
                            value={formData.vehicleCount || ""}
                            onChange={handleInputChange}
                            placeholder="How many?"
                            className="w-full sm:w-24 px-2 py-1 border text-black rounded-lg border-gray-300"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Investment Capacity */}
                    <div className=" gap-6 ">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Investment Capacity (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-[#FE681C] text-lg font-semibold">
                          ₹
                        </span>
                        <select
                          id="investmentCapacity"
                          name="investmentCapacity"
                          value={formData.investmentCapacity}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-2 py-2 text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring"
                        >
                          <option value="">
                            Select Your Investment Capacity
                          </option>
                          <option value="Just Started">Just Started</option>
                          <option value="Below 1 L">Below 1 L</option>
                          <option value="1-5 L">1-5 L</option>
                          <option value="5-10 L">5-10 L</option>
                          <option value="10-20 L">10-20 L</option>
                          <option value="20-40 L">20-40 L</option>
                          <option value="40-70 L">40-70 L</option>
                          <option value="70 L-1 Cr">70 L-1 Cr</option>
                          <option value="1-2 Cr">1-2 Cr</option>
                          <option value="2-5 Cr">2-5 Cr</option>
                          <option value="5 Cr+">5 Cr+</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Share Your Images (Multiple)
                      </label>

                      <div className="relative">
                        {/* Hidden actual file input */}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          id="imageUpload"
                          onChange={handleImageChange}
                          className="hidden"
                        />

                        {/* Custom placeholder/button */}
                        <label
                          htmlFor="imageUpload"
                          className="flex items-center gap-2 cursor-pointer border border-gray-300 rounded-xl px-4 py-2 text-gray-700 hover:border-[#FE681C] transition-all"
                        >
                          <ImageIcon className="w-5 h-5 text-[#FE681C]" />
                          {selectedImages.length > 0
                            ? `${selectedImages.length} file(s) selected`
                            : "Click to choose images"}
                        </label>
                      </div>

                      {/* Preview Images */}
                      {imagePreviews.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative w-24 h-24">
                              <img
                                src={preview}
                                alt={`Preview ${index}`}
                                className="w-24 h-24 object-cover rounded-xl border"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full  bg-[#FE681C] text-white cursor-pointer py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg hover:bg-[#e67035] disabled:bg-[#FE681C] disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-center"
                  >
                    {isSubmitting ? "Processing..." : "Submit Application"}
                  </button>

                  {/* 🔹 Notification near Submit button */}
                  {notificationMessage && (
                    <div
                      className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl text-center font-medium text-sm sm:text-base transition-all ${
                        notificationType === "success"
                          ? "bg-green-100 border border-green-300 text-green-800"
                          : "bg-red-100 border border-red-300 text-red-800"
                      }`}
                    >
                      {notificationMessage}
                    </div>
                  )}

                  {isVerified && (
                    <div className="text-center mt-4">
                      <p className="text-sm text-green-600 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Email verified successfully!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
