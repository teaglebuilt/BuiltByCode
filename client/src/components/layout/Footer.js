import React from "react";

export default function Footer() {
  return (
    <div>
      <footer class="bg-dark text-white mt-5 p-4 text-center">
        Copyright &copy; {new Date().getFullYear()} | Dillan Teagle
      </footer>
    </div>
  );
}
