import React from 'react'

const styles = {
  wrapper: 'flex justify-between p-5  hover:bg-[#30363B] duration-300',
  container: 'flex flex-col text-white items-center justify-center',
  name: 'font-bold',
  chart: 'w-36 h-full',
  price: 'flex flex-col text-white',
  percent: 'text-green-400',
}

const Asset = () => {

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.name}>ETH</div>
      </div>
      <div>
        <div className={styles.chart}>
        </div>
      </div>
      <div className={styles.price}>
        <div>2030$</div>
        <div
          className={styles.percent}
        >
        </div>
      </div>
    </div>
  )
}

export default Asset