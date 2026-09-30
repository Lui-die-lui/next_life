"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExperienceForm } from "./experience-form";
import { createExperience } from "@/server/actions/experiences";

export function NewExperienceForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="self-start">
        + 새 경험 기록하기
      </Button>
    );
  }

  return (
    <Card>
      <p className="mb-3 font-medium text-(--color-text)">새 경험 기록하기</p>
      <ExperienceForm
        submitLabel="기록하기"
        onCancel={() => setOpen(false)}
        onSubmit={async (values) => {
          await createExperience(values);
          setOpen(false);
        }}
      />
    </Card>
  );
}
