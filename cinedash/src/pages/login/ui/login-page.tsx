import { useNavigate } from "@tanstack/react-router";
import { LoginForm } from "@/features/auth/ui/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate({ to: "/discovery" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">CineDash</CardTitle>
        </CardHeader>

        <CardContent>
          <LoginForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
