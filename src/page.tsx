import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { TrendingUp, TrendingDown, ArrowUpDown, Home, RefreshCw } from "lucide-react";
import "./globals.css";
import "./crypto-tracker.css";
import { useDebounce } from "./useDebounce";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  market_cap_rank: number;
}

const HomePage: React.FC<{
  coins: CoinData[];
  loading: boolean;
  searchTerm: string;
  isSearching: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
}> = memo(
  ({
    coins,
    loading,
    searchTerm,
    isSearching,
    onSearchChange,
    onRefresh,
  }: {
    coins: CoinData[];
    loading: boolean;
    searchTerm: string;
    isSearching: boolean;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRefresh: () => void;
  }) => {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: price < 1 ? 6 : 2,
      }).format(price);
    };

    const formatPercentage = (percentage: number) => {
      return `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%`;
    };

    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Cryptocurrency Tracker</h1>
          <button className="refresh-button" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`refresh-icon ${loading ? "spinning" : ""}`} />
            Refresh
          </button>
        </div>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search cryptocurrencies..."
            value={searchTerm}
            onChange={onSearchChange}
            autoComplete="off"
          />
          {isSearching && (
            <div className="search-loading">
              <RefreshCw className="search-spinner" />
              Searching...
            </div>
          )}
        </div>
        {loading ? (
          <div className="skeleton-grid">
            {[...Array(10)].map((_, i) => (
              <div key={`skeleton-${i}`} className="card skeleton-card">
                <div className="card-content compact">
                  <div className="skeleton-item">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-text wide"></div>
                      <div className="skeleton-text narrow"></div>
                    </div>
                    <div className="skeleton-price">
                      <div className="skeleton-price-text"></div>
                      <div className="skeleton-change-text"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="coins-grid">
            {coins.map((coin) => (
              <div key={coin.id} className="card">
                <div className="card-content compact">
                  <div className="coin-item">
                    <div className="coin-info">
                      <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="coin-logo" />
                      <div className="coin-details">
                        <h3>{coin.name}</h3>
                        <p className="coin-meta">
                          #{coin.market_cap_rank} {coin.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="coin-price-info">
                      <p className="coin-price">{formatPrice(coin.current_price)}</p>
                      <div className="coin-changes">
                        <div
                          className={`price-change ${coin.price_change_percentage_24h > 0 ? "positive" : "negative"}`}
                        >
                          {coin.price_change_percentage_24h > 0 ? (
                            <TrendingUp className="change-icon" />
                          ) : (
                            <TrendingDown className="change-icon" />
                          )}
                          {formatPercentage(coin.price_change_percentage_24h)} 24h
                        </div>
                        {coin.price_change_percentage_7d_in_currency && (
                          <div
                            className={`price-change ${coin.price_change_percentage_7d_in_currency > 0 ? "positive" : "negative"}`}
                          >
                            {coin.price_change_percentage_7d_in_currency > 0 ? (
                              <TrendingUp className="change-icon" />
                            ) : (
                              <TrendingDown className="change-icon" />
                            )}
                            {formatPercentage(coin.price_change_percentage_7d_in_currency)} 7d
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);
HomePage.displayName = "HomePage";

const ConverterPage: React.FC<{
  coins: CoinData[];
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  convertedAmount: number | null;
  conversionLoading: boolean;
  onFromCurrencyChange: (value: string) => void;
  onToCurrencyChange: (value: string) => void;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = memo(
  ({
    coins,
    fromCurrency,
    toCurrency,
    amount,
    convertedAmount,
    conversionLoading,
    onFromCurrencyChange,
    onToCurrencyChange,
    onAmountChange,
  }: {
    coins: CoinData[];
    fromCurrency: string;
    toCurrency: string;
    amount: string;
    convertedAmount: number | null;
    conversionLoading: boolean;
    onFromCurrencyChange: (value: string) => void;
    onToCurrencyChange: (value: string) => void;
    onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => {
    return (
      <div className="converter-container">
        <h1 className="page-title">Crypto Converter</h1>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <ArrowUpDown className="nav-icon" />
              Convert Cryptocurrency
            </h2>
          </div>
          <div className="card-content">
            <div className="converter-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">From</label>
                  <select
                    className="select-trigger"
                    value={fromCurrency}
                    onChange={(e) => onFromCurrencyChange(e.target.value)}
                  >
                    {coins.slice(0, 20).map((coin) => (
                      <option key={coin.id} value={coin.id}>
                        {coin.name} ({coin.symbol.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">To</label>
                  <select
                    className="select-trigger"
                    value={toCurrency}
                    onChange={(e) => onToCurrencyChange(e.target.value)}
                  >
                    {coins.slice(0, 20).map((coin) => (
                      <option key={coin.id} value={coin.id}>
                        {coin.name} ({coin.symbol.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  className="number-input"
                  value={amount}
                  onChange={onAmountChange}
                  placeholder="Enter amount"
                  min="0"
                  step="any"
                />
              </div>
              {convertedAmount !== null && (
                <div className="card conversion-result">
                  <div className="card-content">
                    <div className="result-content">
                      <p className="result-label">Converted Amount</p>
                      <p className="result-amount">
                        {conversionLoading ? (
                          <RefreshCw className="loading-spinner" />
                        ) : (
                          <>
                            {convertedAmount.toFixed(8)} {coins.find((c) => c.id === toCurrency)?.symbol.toUpperCase()}
                            <br />
                            <span className="result-rate">
                              1 {coins.find((c) => c.id === fromCurrency)?.symbol.toUpperCase()} ={" "}
                              {(convertedAmount / Number(amount)).toFixed(8)}{" "}
                              {coins.find((c) => c.id === toCurrency)?.symbol.toUpperCase()}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
ConverterPage.displayName = "ConverterPage";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [fromCurrency, setFromCurrency] = useState("bitcoin");
  const [toCurrency, setToCurrency] = useState("ethereum");
  const [amount, setAmount] = useState("1");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [conversionLoading, setConversionLoading] = useState(false);
  const fetchCoins = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h,7d",
      );
      const data = await response.json();
      setCoins(data);
    } catch (error) {
      console.error("Error fetching coins:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  const convertCurrency = useCallback(async () => {
    if (!amount || isNaN(Number(amount))) return;
    try {
      setConversionLoading(true);
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${fromCurrency},${toCurrency}&vs_currencies=usd`,
      );
      const data = await response.json();
      const fromPrice = data[fromCurrency]?.usd;
      const toPrice = data[toCurrency]?.usd;
      if (fromPrice && toPrice) {
        const rate = fromPrice / toPrice;
        setConvertedAmount(Number(amount) * rate);
      }
    } catch (error) {
      console.error("Error converting currency:", error);
    } finally {
      setConversionLoading(false);
    }
  }, [fromCurrency, toCurrency, amount]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);
  useEffect(() => {
    if (fromCurrency && toCurrency && amount) {
      convertCurrency();
    }
  }, [convertCurrency]);
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);
  const filteredCoins = useMemo(() => {
    return coins.filter(
      (coin: CoinData) =>
        coin.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
    );
  }, [coins, debouncedSearchTerm]);
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);
  const handleFromCurrencyChange = useCallback((value: string) => {
    setFromCurrency(value);
  }, []);
  const handleToCurrencyChange = useCallback((value: string) => {
    setToCurrency(value);
  }, []);
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  }, []);
  const handlePageChange = useCallback((page: "home" | "converter") => {
    setCurrentPage(page);
  }, []);
  return (
    <div className="app-container">
      <div className="main-content">
        {/* Navigation */}
        <div className="navigation">
          <div className="nav-buttons">
            <button
              className={`nav-button ${currentPage === "home" ? "active" : ""}`}
              onClick={() => handlePageChange("home")}
            >
              <Home className="nav-icon" />
              Home
            </button>
            <button
              className={`nav-button ${currentPage === "converter" ? "active" : ""}`}
              onClick={() => handlePageChange("converter")}
            >
              <ArrowUpDown className="nav-icon" />
              Converter
            </button>
          </div>
        </div>
        {/* Page Content */}
        {currentPage === "home" ? (
          <HomePage
            coins={filteredCoins}
            loading={loading}
            searchTerm={searchTerm}
            isSearching={isSearching}
            onSearchChange={handleSearchChange}
            onRefresh={fetchCoins}
          />
        ) : (
          <ConverterPage
            coins={coins}
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
            amount={amount}
            convertedAmount={convertedAmount}
            conversionLoading={conversionLoading}
            onFromCurrencyChange={handleFromCurrencyChange}
            onToCurrencyChange={handleToCurrencyChange}
            onAmountChange={handleAmountChange}
          />
        )}
      </div>
    </div>
  );
}

export default App;
