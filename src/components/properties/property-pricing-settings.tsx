"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { sr } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PropertyPriceCalendar } from "@/components/properties/property-price-calendar";
import {
  useCreatePropertyPriceRule,
  useDeletePropertyPriceRule,
  usePropertyPriceRules,
  useUpdatePropertyStartingPrice,
} from "@/hooks/use-property-price-rules";
import { parseStartingPrice } from "@/lib/public/stay-price";
import type { Property } from "@/types/database";
import { toast } from "sonner";

interface PropertyPricingSettingsProps {
  property: Property;
}

export function PropertyPricingSettings({ property }: PropertyPricingSettingsProps) {
  const { data: rules = [], isLoading } = usePropertyPriceRules(property.id);
  const createRule = useCreatePropertyPriceRule();
  const deleteRule = useDeletePropertyPriceRule();
  const updateStartingPrice = useUpdatePropertyStartingPrice();

  const [defaultPrice, setDefaultPrice] = useState(
    property.starting_price?.toString() ?? ""
  );

  useEffect(() => {
    setDefaultPrice(property.starting_price?.toString() ?? "");
  }, [property.starting_price]);

  const displayDefaultPrice =
    defaultPrice.trim() !== ""
      ? parseStartingPrice(Number.parseFloat(defaultPrice.replace(",", ".")))
      : parseStartingPrice(property.starting_price);

  function handleSaveDefaultPrice() {
    const price = defaultPrice.trim()
      ? Number.parseFloat(defaultPrice.replace(",", "."))
      : null;

    updateStartingPrice.mutate(
      {
        propertyId: property.id,
        startingPrice: Number.isFinite(price) ? price : null,
      },
      {
        onSuccess: () => toast.success("Osnovna cijena sačuvana"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Greška"),
      }
    );
  }

  function handleAddPeriod(startDate: string, endDate: string, price: number) {
    createRule.mutate(
      {
        propertyId: property.id,
        startDate,
        endDate,
        pricePerNight: price,
      },
      {
        onSuccess: () => toast.success("Cijena za period dodata"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Greška"),
      }
    );
  }

  function formatPeriod(start: string, end: string) {
    const startLabel = format(parseISO(start), "d. MMM yyyy", { locale: sr });
    const endLabel = format(parseISO(end), "d. MMM yyyy", { locale: sr });
    return start === end ? startLabel : `${startLabel} – ${endLabel}`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cijene po noći</CardTitle>
        <p className="text-sm text-muted-foreground">
          Na kalendaru vidite trenutnu cijenu za svaki dan. Kliknite dan,
          unesite cijenu i primijenite — ili drugi klik za cijeli period.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor={`default-price-${property.id}`}>
              Osnovna cijena (€ / noć)
            </Label>
            <Input
              id={`default-price-${property.id}`}
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(e.target.value)}
              placeholder="80"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDefaultPrice}
            disabled={updateStartingPrice.isPending}
          >
            {updateStartingPrice.isPending ? "Čuvanje…" : "Sačuvaj osnovnu"}
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Učitavanje kalendara…</p>
        ) : (
          <PropertyPriceCalendar
            rules={rules}
            defaultPrice={displayDefaultPrice}
            onAddPeriod={handleAddPeriod}
            adding={createRule.isPending}
          />
        )}

        {!isLoading && rules.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Postavljeni periodi</p>
            <div className="divide-y divide-border rounded-xl border border-border">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {formatPeriod(rule.start_date, rule.end_date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(rule.price_per_night).toFixed(0)} € po noći
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      deleteRule.mutate(
                        { id: rule.id, propertyId: property.id },
                        {
                          onSuccess: () => toast.success("Period obrisan"),
                          onError: (err) =>
                            toast.error(
                              err instanceof Error ? err.message : "Greška"
                            ),
                        }
                      )
                    }
                    disabled={deleteRule.isPending}
                    aria-label="Obriši period"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
