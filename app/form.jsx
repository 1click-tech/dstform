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
} from "lucide-react";

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
    brandsAssociated: "",
    warehouseDetails: "",
    territoryInterested: "",
    retailersCovered: "",
    interestedCategory: "",
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
        setNotificationMessage("OTP sent to your email! 🎉");
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
        setNotificationMessage("Email verified successfully! 🎉");
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

   if (!isVerified) {
  setNotificationMessage("Please verify your email before submitting!");
  setNotificationType("error");
  setTimeout(() => setNotificationMessage(""), 3000);
  return;
}

  const isValid = validateForm();
if (!isValid) {
  const firstErrorField = document.querySelector(
    `[name="${Object.keys(errors)[0]}"]`
  );
  if (firstErrorField) {
    firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
    firstErrorField.focus();
  }

  setNotificationMessage("Please fill all mandatory fields highlighted in red.");
  setNotificationType("error");
  setTimeout(() => setNotificationMessage(""), 4000);

  return;
}

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/save-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, docId: data.docId }));
        setTimeout(() => {
          setShowQRCode(true);
          setSuccessMessage("");
        }, 1500);

        setIsVerified(false);
        setVerificationSent(false);
      } else {
        alert(data.error);
      }
    } catch (err) {
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
            brandsAssociated: "",
            warehouseDetails: "",
            territoryInterested: "",
            retailersCovered: "",
            interestedCategory: "",
            deliveryVehicles: "",
            vehicleCount: "",
            investmentCapacity: "",
            otp: "",
            referenceId: "",
            docId: "",
          });
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
              className="w-full px-2 py-1 border text-black rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          {/* Logo Placeholder - Replace with your actual logo */}
          <div className=" flex items-center justify-center ">
            <img
              src="/logo.png"
              alt="Company Logo"
              className="mx-auto w-100 mb-4  object-contain"
            />
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Distributors Onboarding Form
          </h1>
          <p className="text-gray-600">
            Please provide all details of your business for further process.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-xl text-center font-medium">
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
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

          <div className="space-y-6 text-black">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 text-black gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 px-2 py-1 text-black border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.fullName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-2 py-1 border text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.companyName ? "border-red-500" : "border-gray-300"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-2 py-1 border text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email"
                    disabled={verificationSent || isVerified}
                  />
                </div>
                {!isVerified ? (
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={!formData.email || otpLoading || verificationSent}
                    className="bg-blue-600 text-white px-3 py-1 cursor-pointer rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                  >
                    {otpLoading
                      ? "Sending..."
                      : verificationSent
                      ? "Sent!"
                      : "Verify Email"}
                  </button>
                ) : (
                  <div className="flex items-center px-2 py-1 bg-green-100 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-700 font-medium">Verified</span>
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.email}
                </p>
              )}

              {verificationSent && !isVerified && (
                <div className="mt-3">
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp || ""}
                    onChange={handleInputChange}
                    placeholder="Enter OTP"
                    className="w-full px-2 py-1 border rounded-xl"
                  />

                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    className="bg-green-600 text-white px-2 py-1 rounded-xl mt-2 cursor-pointer"
                  >
                    Verify
                  </button>

                  {/* 🔹 Resend Button OTP input ke neeche */}
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0}
                      className="text-blue-600 font-medium hover:underline disabled:text-gray-400"
                    >
                      {resendTimer > 0
                        ? `Resend OTP in ${resendTimer}s`
                        : "Resend OTP"}
                    </button>
                  </div>
                </div>
              )}
              </div>
               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-2 py-1 border text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-1 border text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your city"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.city}
                  </p>
                )}
              </div>
               {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-2 py-1 border text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your full address"
                />
              </div>
              {errors.address && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.address}
                </p>
              )}
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PAN Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-1 border text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.panNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your PAN number"
                />
                {errors.panNumber && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.panNumber}
                  </p>
                )}
              </div>

              {/* Aadhar Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Aadhar Number
                </label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-1 border text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.aadharNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your Aadhar number"
                />
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border text-black rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your GST number"
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Business <span className="text-red-600">*</span>
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-1 border text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.businessType ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Dealer">Dealer</option>
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Fresher">Fresher</option>
                </select>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Shop & Establishment License (If Applicable)
                </label>
                <input
                  type="text"
                  name="shopLicense"
                  value={formData.shopLicense}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border text-black rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter License Number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  FSSAI License (If Applicable)
                </label>
                <input
                  type="text"
                  name="fssaiLicense"
                  value={formData.fssaiLicense}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border text-black rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter FSSAI Number"
                />
              </div>
            </div>

            {/* Product Categories and Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Product Categories Handled
                </label>
                <input
                  type="text"
                  name="productCategories"
                  value={formData.productCategories}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border text-black rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter categories"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Experience in Distribution (Years)
                </label>
                <input
                  type="number"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border text-black rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter number of years"
                />
              </div>
            </div>

            {/* Brands Associated and Warehouse Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Existing Brands Associated With
                </label>
                <input
                  type="text"
                  name="brandsAssociated"
                  value={formData.brandsAssociated}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border text-black rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter brand names"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Warehouse / Godown Size & Location
                </label>
                <input
                  type="text"
                  name="warehouseDetails"
                  value={formData.warehouseDetails}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border text-black rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter details"
                />
              </div>
            </div>

            {/* Territory and Retailers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Area / Territory Interested
                </label>
                <input
                  type="text"
                  name="territoryInterested"
                  value={formData.territoryInterested}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border text-black rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter area or territory"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  No. of Retailers/Wholesellers Covered
                </label>
                <input
                  type="number"
                  name="retailersCovered"
                  value={formData.retailersCovered}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border text-black rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter numbers"
                />
              </div>
            </div>

            {/* Interested Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Interested In Product/Category
              </label>
              <input
                type="text"
                name="interestedCategory"
                value={formData.interestedCategory}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border text-black rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product/category"
              />
            </div>

            {/* Delivery Vehicles */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Delivery Vehicles
              </label>
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryVehicles"
                    value="No"
                    checked={formData.deliveryVehicles === "No"}
                    onChange={handleInputChange}
                  />{" "}
                  No
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryVehicles"
                    value="Yes"
                    checked={formData.deliveryVehicles === "Yes"}
                    onChange={handleInputChange}
                  />{" "}
                  Yes
                </label>
                {formData.deliveryVehicles === "Yes" && (
                  <input
                    type="number"
                    name="vehicleCount"
                    value={formData.vehicleCount || ""}
                    onChange={handleInputChange}
                    placeholder="How many?"
                    className="ml-3 w-24 px-2 py-1 border text-black rounded-lg border-gray-300"
                  />
                )}
              </div>
            </div>

            {/* Investment Capacity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Investment Capacity (₹)
              </label>
              <input
                type="number"
                name="investmentCapacity"
                value={formData.investmentCapacity}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border text-black rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your investment capacity"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white cursor-pointer py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isSubmitting ? "Processing..." : "Submit Application"}
            </button>

            {/* 🔹 Notification near Submit button */}
              {notificationMessage && (
                <div
                  className={`mt-3 p-3 rounded-xl text-center font-medium transition-all duration-200 ${
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

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            After submission, you'll receive a QR code for payment processing.
          </p>
          <p>
            Upon successful payment, We will verify manually and will reach out
            to you.
          </p>
        </div>
      </div>
    </div>
  );
}
