import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/utils/api";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { useMutation } from "@tanstack/react-query";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const authMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await fetchApi("/api/v1/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error("Google login failed via backend");
      return res.json();
    },
    onSuccess: (dbData) => {
      if (dbData.token) {
        localStorage.setItem("token", dbData.token);
      }
      login(dbData.user);
      if (dbData.user?.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    },
    onError: (error) => {
      console.error("Failed to authenticate user on backend", error);
    },
  });

  const handleUserLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const userInfo = await userInfoRes.json();

        const userData = {
          name: userInfo.name || "User",
          email: userInfo.email,
          picture: userInfo.picture,
        };

        authMutation.mutate(userData);
      } catch (error) {
        console.error("Failed to fetch user info from Google", error);
      }
    },
    onError: (error) => console.log("Google Login process aborted:", error),
  });

  const GoogleIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="20"
      height="20"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.15 0 5.97 1.09 8.2 2.87l6.1-6.1C34.58 2.66 29.6 1 24 1 14.61 1 6.6 6.64 2.74 14.76l7.6 5.9C12.4 13.9 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.63-.15-3.2-.42-4.72H24v9h12.42c-.54 2.9-2.2 5.35-4.7 7.01l7.27 5.65C43.75 37.26 46.1 31.4 46.1 24.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.34 28.66A14.6 14.6 0 0 1 9.5 24c0-1.62.28-3.2.84-4.66l-7.6-5.9A23.95 23.95 0 0 0 1 24c0 3.87.93 7.52 2.74 10.56l7.6-5.9z"
      />
      <path
        fill="#34A853"
        d="M24 47c6.48 0 11.92-2.14 15.9-5.8l-7.27-5.65c-2.02 1.36-4.6 2.17-8.63 2.17-6.3 0-11.6-4.4-13.66-10.16l-7.6 5.9C6.6 41.36 14.61 47 24 47z"
      />
    </svg>
  );

  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center gap-6",
        className
      )}
      {...props}
    >
      <Card className="overflow-hidden p-0 w-full md:w-lg">
        <CardContent>
          <div className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <img className="w-10 h-10 dark:hidden" src="/acres_dark.svg" alt="Acres Inc" />
                <img className="w-10 h-10 hidden dark:block" src="/acres_light.svg" alt="Acres Inc" />
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your Acres account
                </p>
              </div>

              <Button
                variant="outline"
                type="button"
                className="flex items-center justify-center gap-2 w-full"
                onClick={() => handleUserLogin()}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </Button>
            </FieldGroup>
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
