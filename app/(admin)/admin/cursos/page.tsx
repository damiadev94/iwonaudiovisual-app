"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, BookOpen, GripVertical, Eye, EyeOff } from "lucide-react";
import type { Course } from "@/types";

const categories = [
  { value: "finanzas", label: "Finanzas" },
  { value: "marketing", label: "Marketing" },
  { value: "branding", label: "Branding" },
  { value: "distribucion", label: "Distribucion" },
  { value: "legal", label: "Legal" },
  { value: "estrategia", label: "Estrategia" },
];

export default function CursosAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("finanzas");

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    const supabase = createClient();
    const { data } = await supabase
      .from("courses")
      .select("*")
      .order("sort_order", { ascending: true });
    setCourses((data || []) as Course[]);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const supabase = createClient();
    const { error } = await supabase.from("courses").insert({
      title,
      slug,
      description: formData.get("description") as string,
      category: selectedCategory,
      is_published: false,
      sort_order: courses.length,
    });

    if (error) {
      toast.error("Error al crear el curso");
    } else {
      toast.success("Curso creado");
      setDialogOpen(false);
      fetchCourses();
    }
  }

  async function togglePublish(id: string, current: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("courses")
      .update({ is_published: !current })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar");
    } else {
      setCourses(courses.map((c) => c.id === id ? { ...c, is_published: !current } : c));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Estas seguro de eliminar este curso?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar");
    } else {
      toast.success("Curso eliminado");
      fetchCourses();
    }
  }

  if (loading) return <div className="animate-pulse text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cursos</h1>
          <p className="text-muted-foreground">Gestion de cursos y lecciones.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="bg-gold hover:bg-gold-light text-black font-semibold" />}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo curso
          </DialogTrigger>
          <DialogContent className="bg-iwon-card border-iwon-border">
            <DialogHeader>
              <DialogTitle>Crear nuevo curso</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Titulo</Label>
                <Input name="title" required className="bg-iwon-bg border-iwon-border" />
              </div>
              <div className="space-y-2">
                <Label>Descripcion</Label>
                <Textarea name="description" className="bg-iwon-bg border-iwon-border" />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v ?? "finanzas")}>
                  <SelectTrigger className="bg-iwon-bg border-iwon-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-iwon-card border-iwon-border">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-gold hover:bg-gold-light text-black font-semibold">
                Crear curso
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {courses.map((course) => (
          <Card key={course.id} className="bg-iwon-card border-iwon-border">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <BookOpen className="h-5 w-5 text-gold" />
                <div>
                  <h3 className="font-medium">{course.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs border-gold/20 text-gold">
                      {categories.find((c) => c.value === course.category)?.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">/{course.slug}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {course.is_published ? (
                    <Eye className="h-4 w-4 text-iwon-success" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    checked={course.is_published}
                    onCheckedChange={() => togglePublish(course.id, course.is_published)}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 border-iwon-error/30 text-iwon-error hover:bg-iwon-error/10"
                  onClick={() => handleDelete(course.id)}
                >
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {courses.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No hay cursos creados.</p>
        )}
      </div>
    </div>
  );
}
