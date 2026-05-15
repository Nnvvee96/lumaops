// Dev catalog for the shadcn primitives shipped in S2C.
// Gated against production builds; this route is dev-only.

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { notFound } from "next/navigation";

export default function PrimitivesPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="container mx-auto max-w-4xl py-16">
      <header className="mb-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          S2C — primitives catalog
        </p>
        <h1 className="mt-2 text-3xl font-light">shadcn primitives</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dev-only. Token overrides land in S2D.
        </p>
      </header>

      <section className="space-y-8">
        <Demo label="Button">
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </div>
        </Demo>

        <Demo label="Card">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Source + freshness coming in S3D.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cards host metric tiles and integration tiles. Operator
                surfaces extend them; never one-off classes.
              </p>
            </CardContent>
          </Card>
        </Demo>

        <Demo label="Badge">
          <div className="flex flex-wrap gap-2">
            <Badge>default</Badge>
            <Badge variant="secondary">secondary</Badge>
            <Badge variant="outline">outline</Badge>
            <Badge variant="destructive">destructive</Badge>
          </div>
        </Demo>

        <Demo label="DropdownMenu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Workspace</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Demo>

        <Demo label="Tabs">
          <Tabs defaultValue="overview" className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="releases">Releases</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-sm text-muted-foreground">Overview content.</p>
            </TabsContent>
            <TabsContent value="releases">
              <p className="text-sm text-muted-foreground">Releases content.</p>
            </TabsContent>
            <TabsContent value="support">
              <p className="text-sm text-muted-foreground">Support content.</p>
            </TabsContent>
          </Tabs>
        </Demo>

        <Demo label="Tooltip">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover for info</Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip body content.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Demo>

        <Demo label="Sheet (mobile-collapsing sidebar carrier, S2E)">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open sheet</Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>LumaOps</SheetTitle>
                <SheetDescription>Mobile sidebar surface.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </Demo>
      </section>
    </main>
  );
}

function Demo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="rounded-lg border border-border p-6">{children}</div>
    </div>
  );
}
