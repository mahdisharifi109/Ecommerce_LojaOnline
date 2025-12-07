import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface SplineChartProps {
  data: Array<{ month: string; revenue: number }>;
}

export default function SplineChart({ data }: SplineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-3xl bg-secondary/10 border border-dashed border-border">
        <p className="text-muted-foreground font-light">Ainda não há dados de vendas para mostrar.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
        <XAxis 
          dataKey="month" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "12px"
          }}
          itemStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
          cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="hsl(var(--primary))" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
          name="Rendimento" 
          unit="€" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
