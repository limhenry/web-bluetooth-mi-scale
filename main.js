import 'regenerator-runtime/runtime'
import Metrics from './metrics'

let scan

const computeData = (data) => {
  const buffer = new Uint8Array(data.buffer)
  const ctrlByte1 = buffer[1]
  const stabilized = ctrlByte1 & (1 << 5)
  const weight = ((buffer[12] << 8) + buffer[11]) / 200
  const impedance = (buffer[10] << 8) + buffer[9]
  if (stabilized > 0) {
    document.querySelector('.progress').removeAttribute('hidden')
  } else {
    document.querySelector('.progress').setAttribute('hidden', '')
  }
  if (impedance > 0 && impedance < 3000 && stabilized) {
    scan.stop()
    const height = document.querySelector('input[name="height"]').value
    const age = document.querySelector('input[name="age"]').value
    const gender = document.querySelector('select[name="gender"]').value
    const metrics = new Metrics(weight, impedance, height, age, gender)
    metrics.getResult().map(item => {
      const html =`<div class="item"><div class="name">${item.name}</div><div class="value">${parseFloat(item.value).toFixed(2)}</div></div>`
      document.querySelector('.result').innerHTML += html
    })
    document.querySelector('.result').removeAttribute('hidden')
    document.querySelector('.progress').setAttribute('hidden', '')
  }
  document.querySelector('.value').innerHTML = parseFloat(weight).toFixed(1)
}

const onButtonClick = async () => {
  try {
    scan = await navigator.bluetooth.requestLEScan({
      acceptAllAdvertisements: true
    })
    document.querySelector('.button.start').setAttribute('hidden', '')
    document.querySelector('.loading').removeAttribute('hidden')
    document.querySelector('.form').setAttribute('hidden', '')
    navigator.bluetooth.addEventListener('advertisementreceived', event => {
      if (event.device.name !== 'MIBCS' || event.device.name !== 'MIBFS') return
      document.querySelector('.loading').setAttribute('hidden', '')
      document.querySelector('.scale').removeAttribute('hidden')
      event.serviceData.forEach((valueDataView) => {  
        computeData(valueDataView)
      })
    })
  } catch (e) {
    if (e.code === 11) return
    if (e.code === 0) {
      alert('Bluetooth scanning permission denied. Please update browser settings to allow access.')
      return
    }
    console.log(e.message)
    alert(e.message)
  }
}

const onInputChange = (e) => {
  const height = document.querySelector('input[name="height"]').value
  const age = document.querySelector('input[name="age"]').value
  if (height > 0 && age > 0) {
    document.querySelector('.button.start').removeAttribute('disabled')
  } else {
    document.querySelector('.button.start').setAttribute('disabled', '')
  }
}

document.querySelector('input[name="height"]').addEventListener('keyup', onInputChange)
document.querySelector('input[name="age"]').addEventListener('keyup', onInputChange)
document.querySelector('.button.start').addEventListener('click', onButtonClick)
