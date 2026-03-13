import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
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

        login({
          name: userInfo.name || "User",
          email: userInfo.email,
          picture: userInfo.picture,
        });

        navigate("/dashboard");
      } catch (error) {
        console.error("Failed to fetch user info", error);
      }
    },
    onError: (error) => console.log("Google Login Failed:", error),
  });

  // const handleGoogleLogin = useGoogleLogin({
  //   // Use 'id-token' flow for backend verification
  //   onSuccess: async (response) => {
  //     const res = await fetch("http://localhost:5000/api/auth/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         token: response.credential, // The JWT from Google
  //         provider: 'google'
  //       }),
  //     });

  //     const data = await res.json();
  //     if (res.ok) {
  //       login(data.user); // Save to AuthContext
  //       localStorage.setItem("app_token", data.token); // Save your app's JWT
  //       navigate("/dashboard");
  //     }
  //   },
  // });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your Acres Inc account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="johndoe@gmail.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="***************"
                  required
                />
              </Field>
              <Field>
                <Button type="submit">Login</Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="grid grid-rows-2 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="flex items-center justify-center gap-2 w-full"
                  onClick={() => handleGoogleLogin()}
                >
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

                  <span>Login with Google</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 23 23"
                    width="20"
                    height="20"
                  >
                    <path fill="#f25022" d="M1 1h10v10H1z" />
                    <path fill="#00a4ef" d="M12 1h10v10H12z" />
                    <path fill="#7fba00" d="M1 12h10v10H1z" />
                    <path fill="#ffb900" d="M12 12h10v10H12z" />
                  </svg>

                  <span>Login with Microsoft</span>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <a href="#">Sign up</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/dashboard.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
