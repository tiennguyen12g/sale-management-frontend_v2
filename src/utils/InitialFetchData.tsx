import React, { useEffect } from 'react'
import { useStaffStore } from "../zustand/staffStore";
import { useAuthStore } from "../zustand/authStore";
export default function InitialFetchData() {
    const {} = useAuthStore();
    const {fetchStaff} = useStaffStore()
    useEffect(() => {
        fetchStaff()
    }, [fetchStaff])
  return null;
}


