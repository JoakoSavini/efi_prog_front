import { useContext } from "react";
import { AppointmentContext } from "./AppointmentContext";

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error(
      "useAppointments debe ser usado dentro de un AppointmentProvider"
    );
  }
  return context;
};
