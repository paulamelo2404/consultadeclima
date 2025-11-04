import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Droplets, Wind, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
}

export const WeatherSearch = () => {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const { toast } = useToast();

  const searchWeather = async () => {
    if (!city.trim()) {
      toast({
        title: "Digite uma cidade",
        description: "Por favor, insira o nome de uma cidade.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Primeiro, obter coordenadas da cidade usando geocoding API
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        toast({
          title: "Cidade não encontrada",
          description: "Tente outro nome de cidade.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, admin1, country } = geoData.results[0];
      const locationName = `${name}${admin1 ? `, ${admin1}` : ""}, ${country}`;

      // Obter dados do clima
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,visibility&timezone=auto`
      );
      const weatherData = await weatherResponse.json();

      const weatherCode = weatherData.current.weather_code;
      const condition = getWeatherCondition(weatherCode);

      setWeather({
        location: locationName,
        temperature: Math.round(weatherData.current.temperature_2m),
        condition,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: Math.round(weatherData.current.wind_speed_10m),
        visibility: Math.round(weatherData.current.visibility / 1000), // converter para km
      });
    } catch (error) {
      toast({
        title: "Erro ao buscar clima",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherCondition = (code: number): string => {
    const conditions: Record<number, string> = {
      0: "Céu limpo",
      1: "Parcialmente nublado",
      2: "Parcialmente nublado",
      3: "Nublado",
      45: "Neblina",
      48: "Neblina",
      51: "Garoa leve",
      53: "Garoa moderada",
      55: "Garoa intensa",
      61: "Chuva leve",
      63: "Chuva moderada",
      65: "Chuva intensa",
      71: "Neve leve",
      73: "Neve moderada",
      75: "Neve intensa",
      77: "Granizo",
      80: "Pancadas de chuva leves",
      81: "Pancadas de chuva moderadas",
      82: "Pancadas de chuva intensas",
      85: "Pancadas de neve leves",
      86: "Pancadas de neve intensas",
      95: "Tempestade",
      96: "Tempestade com granizo leve",
      99: "Tempestade com granizo intenso",
    };
    return conditions[code] || "Condição desconhecida";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--sky-gradient-start))] to-[hsl(var(--sky-gradient-end))] p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Consulta de Clima
          </h1>
          <p className="text-muted-foreground text-lg">
            Busque informações meteorológicas em tempo real
          </p>
        </div>

        <Card className="backdrop-blur-lg bg-card/80 border-border/50 shadow-xl p-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Digite o nome da cidade..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchWeather()}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button
              onClick={searchWeather}
              disabled={loading}
              size="lg"
              className="h-12 px-6"
            >
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </Card>

        {weather && (
          <Card className="backdrop-blur-lg bg-card/90 border-border/50 shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span className="text-lg font-medium">{weather.location}</span>
              </div>

              <div className="text-center space-y-2">
                <div className="text-7xl font-bold text-foreground">
                  {weather.temperature}°
                </div>
                <div className="text-2xl text-muted-foreground font-medium">
                  {weather.condition}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50">
                  <Droplets className="h-6 w-6 text-primary" />
                  <div className="text-sm text-muted-foreground">Umidade</div>
                  <div className="text-xl font-semibold text-foreground">
                    {weather.humidity}%
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50">
                  <Wind className="h-6 w-6 text-primary" />
                  <div className="text-sm text-muted-foreground">Vento</div>
                  <div className="text-xl font-semibold text-foreground">
                    {weather.windSpeed} km/h
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50">
                  <Eye className="h-6 w-6 text-primary" />
                  <div className="text-sm text-muted-foreground">Visibilidade</div>
                  <div className="text-xl font-semibold text-foreground">
                    {weather.visibility} km
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="text-center text-sm text-muted-foreground/80">
          Dados fornecidos por Open-Meteo
        </div>
      </div>
    </div>
  );
};
