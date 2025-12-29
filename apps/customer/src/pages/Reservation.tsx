import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReservationPage from "./ReservationPage";
import ReservationSuccess from "./ReservationSuccess";

type ReservationStep = "form" | "success";

export default function Reservation() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ReservationStep>("form");

  const handleSubmit = () => {
    // In real app, this would submit to API
    setStep("success");
  };

  const handleBackToHome = () => {
    // Navigate to home/menu page
    navigate("/");
  };

  const handleConfirm = () => {
    // Handle confirmation action
    console.log("Confirmation clicked");
  };

  if (step === "success") {
    return (
      <ReservationSuccess
        onBackToHome={handleBackToHome}
        onConfirm={handleConfirm}
        reservationData={{
          date: "24 Okt",
          time: "19:00 WIB",
          guests: 2,
          bookingId: "#B-8829",
          phone: "0812-3456-7890",
        }}
      />
    );
  }

  return <ReservationPage onSubmit={handleSubmit} />;
}
