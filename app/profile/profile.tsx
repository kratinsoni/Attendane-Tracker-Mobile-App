import AuthLayout from "@/components/AuthLayout";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import UserProfile from "@/components/profilePage";

const profile = () => {
  return (
    <AuthLayout>
      <UserProfile />
    </AuthLayout>
  );
};

export default profile;

const styles = StyleSheet.create({});
