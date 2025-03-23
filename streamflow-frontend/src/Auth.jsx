import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bs58 from "bs58";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SolanaAuth = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [signature, setSignature] = useState(null);
  //const [balance, setBalance] = useState(null);
  //const [transactions, setTransactions] = useState([]);

  /*useEffect(() => {
    if (wallet) {
      fetchBalance();
      fetchTransactions();
    }
  }, [wallet]);*/

  useEffect(() => {
    async function checkIfWalletConnected() {
      if (window.solana && window.solana.isPhantom) {
        try {
          const provider = window.solana;
          const response = await provider.connect({ onlyIfTrusted: true });
          if (response.publicKey) {
            setWallet(response.publicKey.toString());
          }
        } catch (error) {
          console.warn("No trusted connection found:", error);
        }
      }
    }
    checkIfWalletConnected();
  }, []);

  useEffect(() => {
    if (window.solana) {
      window.solana.on("disconnect", () => {
        setWallet(null);
        alert("Wallet disconnected. Please reconnect.");
      });
    }
  }, []);

  // Connect to Phantom Wallet
  async function connectWallet() {
    try {
        if (window.solana && window.solana.isPhantom) {
            const provider = window.solana;

            // Request connection
            const response = await provider.connect();
            setWallet(response.publicKey.toString());
            console.log("Wallet connected:", response.publicKey.toString());

            return response.publicKey.toString();
        } else {
            alert("Phantom Wallet not detected! Please install it from https://phantom.app/");
        }
    } catch (error) {
        console.error("Wallet connection failed:", error);
        if (error.message.includes("User rejected the request")) {
            alert("You rejected the connection request. Please try again.");
        }
    }
}

 // const connectWallet = async () => {
 //   if (window.solana && window.solana.isPhantom) {
 //     try {
 //       const response = await window.solana.connect({ onlyIfTrusted: true });
 //       setWallet(response.publicKey.toString());
 //     } catch (error) {
 //       console.error("Wallet connection failed:", error);
 //     }
 //   } else {
 //     alert("Phantom Wallet not found. Please install it from https://phantom.app/download");
  //  }
 // };

  // Sign a message using the connected wallet
  const signMessage = async () => {
    if (!wallet) {
      alert("Connect a wallet first.");
      return;
    }

    const message = "Authenticate with Solana"; // Change this for security
    const encodedMessage = new TextEncoder().encode(message);

    try {
      const signedMessage = await window.solana.signMessage(encodedMessage, "utf8");
      const encodedSignature = bs58.encode(signedMessage.signature);
      setSignature(encodedSignature);

      // Send to backend for verification
      verifySignature(encodedSignature, message);
    } catch (error) {
      console.error("Signing failed:", error);
    }
  };

  const verifySignature = async (signature, message) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature, message, walletAddress: wallet }),
      });
  
      if (!response.ok) {
        // Handle specific HTTP status codes
        if (response.status === 400) {
          throw new Error("Bad request: Missing required fields.");
        } else if (response.status === 401) {
          throw new Error("Unauthorized: Signature verification failed.");
        } else if (response.status === 500) {
          throw new Error("Server error: Please try again later.");
        } else {
          throw new Error(`Unexpected error: ${response.statusText}`);
        }
      }
  
      const data = await response.json();
      if (data.success) {
        alert("Authentication successful!");
  
        // Store JWT token if available
        const token = response.headers.get("Authorization");
        if (token) {
          localStorage.setItem("token", token);
        } else {
          console.warn("Warning: No token received from server.");
        }
  
        navigate("/dashboard");
      } else {
        throw new Error(data.error || "Signature verification failed.");
      }
    } catch (error) {
      console.error("Verification failed:", error.message);
      alert(`Error: ${error.message}`);
    }
  };
  
  // Fetch wallet balance
  /*
  const fetchBalance = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/wallet/balance/${wallet}`);
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  // Fetch transaction history
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/wallet/transactions/${wallet}`);
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };*/
  return (
    <div className="p-8 max-w-lg mx-auto bg-gradient-to-b from-purple-50 to-blue-50 shadow-xl rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-800">Solana Authentication</h2>

      {!wallet ? (
        <button
          onClick={connectWallet}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Connected Wallet</p>
            <p className="text-gray-700 font-mono text-sm overflow-hidden overflow-ellipsis">{wallet}</p>
          </div>

          <button
            onClick={signMessage}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            Sign & Authenticate
          </button>

          {signature && (
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Signature</p>
              <p className="text-gray-700 font-mono text-xs overflow-hidden overflow-ellipsis">{signature}</p>
            </div>
          )}
        </div>
      )}

      {/*balance !== null && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <p className="text-gray-500">Your Balance</p>
            <p className="text-xl font-bold text-indigo-600">{balance} <span className="text-sm">SOL</span></p>
          </div>
        </div>
      )}

      {/*transactions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-indigo-800">Recent Transactions</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {transactions.map((tx, index) => (
              <div key={index} className="p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div className="overflow-hidden">
                    <p className="text-xs font-mono text-gray-500 truncate">{tx.signature}</p>
                    <p className={`text-sm mt-1 ${tx.status === "success" ? "text-green-600" : "text-red-600"} font-medium`}>
                      {tx.status}
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">{tx.fee} lamports</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )*/}
    </div>
  );
};

export default SolanaAuth;