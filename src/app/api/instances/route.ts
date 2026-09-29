import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("ec2_instances")
    .select(`
      id,
      instance_type,
      instance_family,
      vcpu,
      memory_gib,
      architecture,
      ec2_prices (
        price_per_hour,
        currency,
        operating_system,
        pricing_model,
        region_id
      )
    `)
    .limit(100);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}