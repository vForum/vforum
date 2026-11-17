import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Shell from "@/components/Shell";

export const metadata = {
  title: "VForum",
  description: "A clean, modern community forum.",
};

export const viewport = { themeColor: "#212121" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
