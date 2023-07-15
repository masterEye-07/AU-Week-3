import React from 'react';
import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [blockTransactions, setBlockTransactions] = useState([]);
  const [transactionSelected, setTransactionSelected] = useState('');

  useEffect(() => {
    async function getBlockNumber() {
      setBlockNumber(await alchemy.core.getBlockNumber());
    }

    getBlockNumber();
  }, []);

  useEffect(() => {
    async function setTransactions() {
      try {
        const { transactions } = await alchemy.core.getBlockWithTransactions(blockNumber);
        setBlockTransactions(transactions);
      } catch (error) {
        setBlockTransactions([]);
      }
    }

    setTransactions();
  }, [blockNumber]);

  const handleSelectTransaction = (hash) => {
    if (blockTransactions.length === 0) setTransactionSelected('');
    setTransactionSelected(hash);
  };

  const calcFee = (transaction, toFixed) => {
    const gasFee = transaction.gasLimit * transaction.gasPrice;

    if (isNaN(gasFee)) return '0';

    return parseFloat(ethers.formatEther(gasFee.toString())).toFixed(toFixed);
  };

  const previousBlock = () => {
    const actualBlocknumber = blockNumber - 1 < 0 ? 0 : blockNumber - 1;
    setBlockNumber(actualBlocknumber);
  };

  const nextBlock = () => {
    const actualBlocknumber = blockNumber + 1;
    setBlockNumber(actualBlocknumber);
  };

  const getSubstring = (data, index) => {
    try {
      return `${data.substring(0, index)}...`;
    } catch (error) {
      return '';
    }
  };

  const getTransaction = (hash) => {
    const transactions = [...blockTransactions];
    const index = transactions.findIndex((tx) => tx.hash === hash);
    if (index >= 0) return transactions[index];

    return {};
  };

  const Block = () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px',
          background: 'linear-gradient(135deg, #287BFA, #85C1E9)',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
        }}
      >
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '24px' }}>
          Etherscan 3.0
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#F4F7FA',
            borderRadius: '5px',
            padding: '16px',
            marginTop: '24px',
          }}
        >
          <button
            style={{
              marginRight: '24px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '8px 16px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
            onClick={() => previousBlock()}
          >
            Previous Block
          </button>
          <p style={{ margin: 0, fontSize: '18px', color: '#333333' }}>Block Number: {blockNumber}</p>
          <button
            style={{
              marginLeft: '24px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '8px 16px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
            onClick={() => nextBlock()}
          >
            Next Block
          </button>
        </div>
      </div>
    );
  };

  const Transactions = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const transactionsPerPage = 10;
    const totalPages = Math.ceil(blockTransactions.length / transactionsPerPage);

    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;

    const handlePreviousPage = () => {
      setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
      setCurrentPage(currentPage + 1);
    };

    return (
      <div style={{ margin: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
          <thead>
            <tr style={{ background: '#F4F7FA' }}>
              <th style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left' }}>Transaction Hash</th>
              <th style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left' }}>Block</th>
              <th style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left', color: '#1E90FF' }}>From</th>
              <th style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left', color: '#1E90FF' }}>To</th>
              <th style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left' }}>Confirmations</th>
              <th style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left' }}>Value</th>
              <th style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left' }}>Transaction Fee</th>
              <th style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left' }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {blockTransactions.slice(startIndex, endIndex).map((transaction, index) => {
              const rowStyle = {
                background: index % 2 === 0 ? '#fff' : '#f0f8ff',
                color: index % 2 === 0 ? '#000' : '#1E90FF',
              };

              return (
                <tr
                  style={rowStyle}
                  key={transaction.hash}
                  onClick={() => handleSelectTransaction(transaction.hash)}
                >
                  <td style={{ padding: '8px' }}>{getSubstring(transaction.hash, 15)}</td>
                  <td style={{ padding: '8px' }}>{transaction.blockNumber}</td>
                  <td style={{ padding: '8px' }}>{getSubstring(transaction.from, 15)}</td>
                  <td style={{ padding: '8px' }}>{getSubstring(transaction.to, 15)}</td>
                  <td style={{ padding: '8px' }}>{transaction.confirmations}</td>
                  <td style={{ padding: '8px' }}>
                    {parseFloat(ethers.formatEther(transaction.value.toString())).toFixed(12)}
                  </td>
                  <td style={{ padding: '8px' }}>{calcFee(transaction, 5)}</td>
                  <td style={{ padding: '8px' }}>{getSubstring(transaction.data, 15)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ marginTop: '16px' }}>
          <button
            style={{
              background: '#F4F7FA',
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              padding: '8px 16px',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '8px',
            }}
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            &lt; Previous
          </button>
          <span style={{ margin: '0 8px', fontSize: '16px' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            style={{
              background: '#F4F7FA',
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              padding: '8px 16px',
              fontSize: '16px',
              cursor: 'pointer',
              marginLeft: '8px',
            }}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next &gt;
          </button>
        </div>
      </div>
    );
  };

  const Detail = (props) => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          marginLeft: 24,
          fontSize: 14,
          marginBottom: 8,
        }}
      >
        <p style={{ marginLeft: 10, marginRight: 10, fontWeight: 'bold', minWidth: 150 }}>{props.name}:</p>
        <p>{props.value}</p>
      </div>
    );
  };

  const TransactionDetail = (props) => {
    return (
      <div
        style={{
          backgroundColor: '#F4F7FA',
          borderRadius: '5px',
          padding: '16px',
          marginTop: '24px',
          fontSize: '16px',
          border: '1px solid #ddd',
          margin: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontWeight: 'bold', color: '#333333', textTransform: 'uppercase' }}>Transaction Details</h2>
        </div>

        <Detail name={'Transaction Hash'} value={props.transaction.hash} />
        <Detail name={'Block'} value={props.transaction.blockNumber} />
        <Detail name={'From'} value={props.transaction.from} />
        <Detail name={'To'} value={props.transaction.to} />
        <Detail name={'Confirmations'} value={props.transaction.confirmations} />
        <Detail
          name={'Value'}
          value={props.transaction?.value ? parseFloat(ethers.formatEther(props.transaction?.value.toString())).toFixed(18) : '0'}
        />
        <Detail name={'Transaction Fee'} value={calcFee(props.transaction, 18)} />
        <Detail name={'Data'} value={props.transaction.data} />
      </div>
    );
  };

  return (
    <>
      <Block />
      <Transactions />
      <TransactionDetail transaction={getTransaction(transactionSelected)} />
    </>
  );
}

export default App;
