import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { Mail } from "lucide-react";

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-iwon-bg px-4">
      <Card className="w-full max-w-md bg-iwon-card border-iwon-border text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-gold" />
          </div>
          <CardTitle className="text-2xl">Revisa tu email</CardTitle>
          <CardDescription>
            Te enviamos un link de confirmacion. Hace click en el link para activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No lo encontras? Revisa la carpeta de spam.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full border-iwon-border hover:bg-iwon-bg-secondary">
              Volver al login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
