import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Droplets, Wind, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CityOption {
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
}

interface DailyForecast {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
}

export const WeatherSearch = () => {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const { toast } = useToast();

  const searchCities = async () => {
    if (!city.trim()) {
      toast({
        title: "Digite uma cidade",
        description: "Por favor, insira o nome de uma cidade.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setShowOptions(false);
    setCityOptions([]);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=pt&format=json`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        toast({
          title: "Cidade não encontrada",
          description: "Tente com outro nome ou adicione o estado/país (ex: 'Belo Horizonte, MG' ou 'Paris, França')",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const options: CityOption[] = geoData.results.map((result: any) => ({
        name: result.name,
        admin1: result.admin1,
        country: result.country,
        latitude: result.latitude,
        longitude: result.longitude,
        displayName: `${result.name}${result.admin1 ? `, ${result.admin1}` : ""}, ${result.country}`,
      }));

      if (options.length === 1) {
        await loadWeatherData(options[0]);
      } else {
        setCityOptions(options);
        setShowOptions(true);
        setLoading(false);
      }
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar as cidades. Tente novamente.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const loadWeatherData = async (cityOption: CityOption) => {
    setLoading(true);
    setShowOptions(false);

    try {
      const { latitude, longitude, displayName } = cityOption;

      // Obter dados do clima atual e previsão semanal
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,visibility&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean&timezone=auto`
      );
      const weatherData = await weatherResponse.json();

      const weatherCode = weatherData.current.weather_code;
      const condition = getWeatherCondition(weatherCode);

      setWeather({
        location: displayName,
        temperature: Math.round(weatherData.current.temperature_2m),
        condition,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: Math.round(weatherData.current.wind_speed_10m),
        visibility: Math.round(weatherData.current.visibility / 1000),
      });

      // Processar previsão dos próximos 7 dias
      const dailyForecasts: DailyForecast[] = weatherData.daily.time.map((date: string, index: number) => {
        const dateObj = new Date(date);
        const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const dayName = index === 0 ? "Hoje" : dayNames[dateObj.getDay()];

        return {
          date,
          dayName,
          tempMax: Math.round(weatherData.daily.temperature_2m_max[index]),
          tempMin: Math.round(weatherData.daily.temperature_2m_min[index]),
          condition: getWeatherCondition(weatherData.daily.weather_code[index]),
          humidity: Math.round(weatherData.daily.relative_humidity_2m_mean[index]),
          windSpeed: Math.round(weatherData.daily.wind_speed_10m_max[index]),
          precipitation: Math.round(weatherData.daily.precipitation_sum[index] * 10) / 10,
          weatherCode: weatherData.daily.weather_code[index],
        };
      });

      setForecast(dailyForecasts);
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
                onKeyPress={(e) => e.key === "Enter" && searchCities()}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button
              onClick={searchCities}
              disabled={loading}
              size="lg"
              className="h-12 px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando
                </>
              ) : (
                "Buscar"
              )}
            </Button>
          </div>
        </Card>

        {showOptions && cityOptions.length > 0 && (
          <Card className="backdrop-blur-lg bg-card/90 border-border/50 shadow-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Selecione a cidade:
            </h3>
            <div className="space-y-2">
              {cityOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => loadWeatherData(option)}
                  className="w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-foreground">{option.displayName}</span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {weather && (
          <>
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

            {forecast.length > 0 && (
              <Card className="backdrop-blur-lg bg-card/90 border-border/50 shadow-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Previsão para 7 dias
                </h2>
                <div className="space-y-3">
                  {forecast.map((day, index) => (
                    <div
                      key={day.date}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 font-semibold text-foreground">
                          {day.dayName}
                        </div>
                        <div className="text-sm text-muted-foreground flex-1 min-w-0">
                          {day.condition}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Droplets className="h-4 w-4 text-primary" />
                          <span className="text-foreground">{day.precipitation}mm</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Wind className="h-4 w-4 text-primary" />
                          <span className="text-foreground">{day.windSpeed}km/h</span>
                        </div>
                        <div className="flex items-center gap-3 min-w-[100px] justify-end">
                          <span className="text-lg font-semibold text-foreground">
                            {day.tempMax}°
                          </span>
                          <span className="text-lg text-muted-foreground">
                            {day.tempMin}°
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        <div className="text-center text-sm text-muted-foreground/80">
          Dados fornecidos por Open-Meteo
        </div>
      </div>
    </div>
  );
};
