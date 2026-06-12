"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { appLocale } from "@/lib/dates/locale";
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
        onSuccess: () => toast.success("Base price saved"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Error"),
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
        onSuccess: () => toast.success("Period price added"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Error"),
      }
    );
  }

  function formatPeriod(start: string, end: string) {
    const startLabel = format(parseISO(start), "d. MMM yyyy", { locale: appLocale });
    const endLabel = format(parseISO(end), "d. MMM yyyy", { locale: appLocale });
    return start === end ? startLabel : `${startLabel} – ${endLabel}`;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle>Nightly prices</CardTitle>
        <p className="text-sm text-muted-foreground">
          The calendar shows the current price for each day. Click a day, enter
          a price and apply — or click a second day to set a full period.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor={`default-price-${property.id}`}>
              Base price (€ / night)
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
            {updateStartingPrice.isPending ? "Saving…" : "Save base price"}
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading calendar…</p>
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
            <p className="text-sm font-medium">Configured periods</p>
            <div className="divide-y divide-border rounded-xl border border-border">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-start justify-between gap-3 px-3 py-3 sm:items-center sm:px-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {formatPeriod(rule.start_date, rule.end_date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(rule.price_per_night).toFixed(0)} € per night
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
                          onSuccess: () => toast.success("Period deleted"),
                          onError: (err) =>
                            toast.error(
                              err instanceof Error ? err.message : "Error"
                            ),
                        }
                      )
                    }
                    disabled={deleteRule.isPending}
                    aria-label="Delete period"
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
