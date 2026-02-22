import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [showSettings, setShowSettings] = useState(true)
  const [showRedPacket, setShowRedPacket] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [showEnd, setShowEnd] = useState(false)
  const [showLimit, setShowLimit] = useState(false)
  const [totalAmount, setTotalAmount] = useState('100')
  const [packetCount, setPacketCount] = useState('10')
  const [remainingAmount, setRemainingAmount] = useState(100)
  const [remainingCount, setRemainingCount] = useState(10)
  const [amount, setAmount] = useState(0)
  const [isOpening, setIsOpening] = useState(false)
  const [redPacketList, setRedPacketList] = useState([])
  const [userId, setUserId] = useState(null)
  const [redPacketId, setRedPacketId] = useState(null)

  // 初始化用户ID
  useEffect(() => {
    let id = localStorage.getItem('userId')
    if (!id) {
      id = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 10000)
      localStorage.setItem('userId', id)
    }
    setUserId(id)
  }, [])

  const createRedPacket = () => {
    const total = parseFloat(totalAmount)
    const count = parseInt(packetCount)
    if (isNaN(total) || total <= 0) {
      alert('请输入有效的总金额')
      return
    }
    if (isNaN(count) || count <= 0) {
      alert('请输入有效的红包数量')
      return
    }
    if (total < count * 0.01) {
      alert('总金额不能小于红包数量 * 0.01')
      return
    }
    
    // 生成新的红包ID
    const newRedPacketId = 'packet_' + Date.now()
    setRedPacketId(newRedPacketId)
    
    // 清除当前用户的抢红包记录
    localStorage.removeItem('hasOpened_' + newRedPacketId)
    
    setRemainingAmount(total)
    setRemainingCount(count)
    setRedPacketList([])
    setShowSettings(false)
    setShowRedPacket(true)
  }

  const openRedPacket = () => {
    if (remainingCount <= 0) {
      setShowEnd(true)
      setShowRedPacket(false)
      return
    }
    
    // 检查用户是否已经抢过这个红包
    if (userId && redPacketId) {
      const hasOpened = localStorage.getItem('hasOpened_' + redPacketId)
      if (hasOpened) {
        setShowLimit(true)
        setShowRedPacket(false)
        return
      }
    }
    
    setIsOpening(true)
    // 模拟打开红包的动画时间
    setTimeout(() => {
      let randomAmount
      if (remainingCount === 1) {
        // 最后一个红包，剩余金额全给
        randomAmount = remainingAmount.toFixed(2)
      } else {
        // 改进的随机金额分配算法
        // 生成更随机的金额，范围在0.01到剩余金额的60%之间
        const maxRatio = Math.min(0.6, remainingAmount / (remainingCount * 2))
        const max = remainingAmount * maxRatio
        const min = 0.01
        randomAmount = (Math.random() * (max - min) + min).toFixed(2)
        // 确保剩余金额足够
        const amountNum = parseFloat(randomAmount)
        const newRemaining = remainingAmount - amountNum
        if (newRemaining < (remainingCount - 1) * 0.01) {
          // 如果剩余金额不够，重新计算
          randomAmount = (remainingAmount - (remainingCount - 1) * 0.01).toFixed(2)
        }
      }
      
      const amountNum = parseFloat(randomAmount)
      setAmount(randomAmount)
      setRemainingAmount(parseFloat((remainingAmount - amountNum).toFixed(2)))
      setRemainingCount(remainingCount - 1)
      setShowRedPacket(false)
      setShowResult(true)
      setIsOpening(false)
      
      // 标记用户已抢过这个红包
      if (userId && redPacketId) {
        localStorage.setItem('hasOpened_' + redPacketId, 'true')
      }
      
      // 添加到红包记录
      setRedPacketList(prev => [
        ...prev,
        {
          id: Date.now(),
          amount: randomAmount,
          time: new Date().toLocaleString(),
          user: '用户' + userId.slice(-4)
        }
      ])
      
      // 检查是否所有红包都抢完了
      if (remainingCount - 1 === 0) {
        setTimeout(() => {
          setShowEnd(true)
          setShowResult(false)
        }, 2000)
      }
    }, 1500)
  }

  const reset = () => {
    setShowResult(false)
    setShowEnd(false)
    setShowLimit(false)
    setAmount(0)
    if (remainingCount > 0) {
      setShowRedPacket(true)
    } else {
      setShowSettings(true)
    }
  }

  return (
    <div className="app">
      <h1 className="title">微信红包</h1>
      
      {showSettings && (
        <div className="settings">
          <h2 className="settings-title">发红包</h2>
          <div className="settings-form">
            <div className="form-group">
              <label className="form-label">总金额（元）</label>
              <input 
                type="number" 
                className="form-input" 
                value={totalAmount} 
                onChange={(e) => setTotalAmount(e.target.value)} 
                min="0.01"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label className="form-label">红包数量</label>
              <input 
                type="number" 
                className="form-input" 
                value={packetCount} 
                onChange={(e) => setPacketCount(e.target.value)} 
                min="1"
                step="1"
              />
            </div>
            <button className="create-btn" onClick={createRedPacket}>生成红包</button>
          </div>
        </div>
      )}

      {showRedPacket && (
        <div className={`red-packet ${isOpening ? 'opening' : ''}`} onClick={openRedPacket}>
          <div className="red-packet-content">
            <div className="red-packet-text">点击拆开</div>
            <div className="red-packet-subtext">恭喜发财，大吉大利</div>
            <div className="red-packet-info">
              剩余 {remainingCount} 个红包
            </div>
          </div>
        </div>
      )}

      {showResult && (
        <div className="result">
          <div className="result-amount">¥{amount}</div>
          <div className="result-text">恭喜您抢到了红包</div>
          <div className="result-info">
            剩余 {remainingCount} 个红包，剩余金额 ¥{remainingAmount}
          </div>
          <button className="reset-btn" onClick={reset}>继续抢</button>
        </div>
      )}

      {showLimit && (
        <div className="result">
          <div className="result-title">抢红包限制</div>
          <div className="result-text">您已经抢过这个红包了</div>
          <div className="result-info">
            每个用户只能抢一次红包
          </div>
          <button className="reset-btn" onClick={reset}>返回</button>
        </div>
      )}

      {showEnd && (
        <div className="result">
          <div className="result-title">红包已抢完</div>
          <div className="result-text">所有红包都已被抢走</div>
          <div className="result-info">
            总金额：¥{totalAmount}，共 {packetCount} 个红包
          </div>
          <button className="reset-btn" onClick={reset}>重新发红包</button>
        </div>
      )}

      <div className="red-packet-list">
        <h2 className="list-title">红包记录</h2>
        {redPacketList.length > 0 ? (
          <ul>
            {redPacketList.map(item => (
              <li key={item.id} className="list-item">
                <span className="list-user">{item.user}</span>
                <span className="list-amount">¥{item.amount}</span>
                <span className="list-time">{item.time}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="list-empty">暂无红包记录</p>
        )}
      </div>
    </div>
  )
}

export default App