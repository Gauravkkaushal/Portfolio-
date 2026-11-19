"use client";
import { useEffect } from "react";
import { initScene } from "@/lib/scene";

// starts the animation engine once the server-rendered markup is on the page
export default function Scene() {
  useEffect(() => initScene(), []);
  return null;
}
