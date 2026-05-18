import { useEffect, useState } from "react";
import { PageHeader } from "@/shared/components/organisms/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/atoms/card";
import { Button } from "@/shared/components/atoms/button";
import { Input } from "@/shared/components/atoms/input";
import { Label } from "@/shared/components/atoms/label";
import { useVerifyUser } from "@/features/auth/hooks/useAuth";
import { useUpdateUser } from "@/features/auth/hooks/useUser";

function ProfileSettingsPage() {
  const { data: user } = useVerifyUser();
  const updateUser = useUpdateUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user?.email, user?.name]);

  return (
    <div className="space-y-8 p-1">
      <PageHeader
        title="Profile & Settings"
        description="Keep admin identity details current and rotate credentials safely."
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Admin profile</CardTitle>
            <CardDescription>These fields update the authenticated admin account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-name">Display name</Label>
              <Input
                id="settings-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input
                id="settings-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-password">New password</Label>
              <Input
                id="settings-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Leave blank to keep the current password"
              />
            </div>

            <Button
              disabled={updateUser.isPending || !user?.id}
              onClick={() => {
                if (!user?.id) return;
                updateUser.mutate({
                  id: user.id,
                  data: {
                    name: name.trim(),
                    email: email.trim(),
                    password: password.trim() || undefined,
                  },
                });
                setPassword("");
              }}
            >
              {updateUser.isPending ? "Saving..." : "Save profile"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle>Operational notes</CardTitle>
            <CardDescription>Current dashboard defaults and admin behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              Currency display defaults to EGP for all KPIs, products, and orders.
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              Realtime order syncing becomes active when Supabase browser env keys are provided.
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              Product archive actions are soft-deletes and immediately hide items from the shop.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfileSettingsPage;
