'use strict'

function Terminal (pilot) {
  this.el = document.createElement('div')
  this.el.id = 'terminal'
  this.display = document.createElement('div')
  this.display.id = 'display'
  this.input = document.createElement('input')
  this.input.setAttribute('placeholder', '>')

  this.chwr = document.createElement('div')
  this.chwr.className = 'wrapper'
  this.chwr.id = 'chwr'
  this.fxwr = document.createElement('div')
  this.fxwr.className = 'wrapper'
  this.fxwr.id = 'fxwr'

  this.channels = []
  this.effects = {}

  this.install = function (host) {
    this.el.appendChild(this.display)
    this.el.appendChild(this.input)
    host.appendChild(this.el)

    for (const id in pilot.synthetiser.channels) {
      const el = document.createElement('div')
      el.id = `ch${id}`
      this.channels.push(el)
      this.chwr.appendChild(el)
    }

    for (const id in pilot.synthetiser.effects) {
      const el = document.createElement('div')
      el.id = `fx${id}`
      this.effects[id] = el
      this.fxwr.appendChild(el)
    }

    this.display.appendChild(this.chwr)
    this.display.appendChild(this.fxwr)
  }

  this.start = function () {
    this.updateAll()
    this.input.focus()
  }

  this.updateAll = function () {
    for (const id in this.channels) {
      this.channels[id].innerHTML = this._channel(id, pilot.synthetiser.channels[id])
    }
    for (const id in this.effects) {
      this.effects[id].innerHTML = this._effect(id, pilot.synthetiser.effects[id])
    }
  }

  this.updateChannel = function (data) {
    if (!data || !this.channels[data.channel]) { return }

    this.channels[data.channel].innerHTML = this._channel(data.channel, data)
    this.channels[data.channel].className = data.isNote === true ? 'note' : 'ctrl'
    setTimeout(() => { this.channels[data.channel].className = '' }, 100)
  }

  this.updateEffect = function (data) {
    if (!data || !this.effects[data.name]) { return }

    this.effects[data.name].innerHTML = this._effect(data.name, data)
    this.effects[data.name].className = data.isNote === true ? 'note' : 'ctrl'
    setTimeout(() => { this.effects[data.name].className = '' }, 100)
  }

  this._channel = function (channel, data) {
    const synth = pilot.synthetiser.channels[channel]
    return `<span><b>${str36(channel).toUpperCase().padEnd(1, '-')}</b> ${this._envelope(synth.envelope)}</span> ${this._octaves(data)}`
  }

  this._envelope = function (env) {
    if (!env) { return '??' }
    return `${to16(env.attack)}${to16(env.decay)}${to16(env.sustain)}${to16(env.release)}`
  }

  this._octaves = function (data) {
    let html = ''
    for (let i = 0; i < 8; i++) {
      html += (data && data.note && i === data.octave ? '<span>' + data.note + '</span>' : '.')
    }
    return html
  }

  this._effect = function (id, data) {
    let html = ''
    html += `<span><b>${id.substr(0, 3).toUpperCase()}</b></span> `
    html += `<span>${to16(pilot.synthetiser.effects[id].wet.value)}`

    if (id === 'reverb') {
      html += to16(pilot.synthetiser.effects[id].roomSize.value)
    } else if (id === 'distortion') {
      html += to16(pilot.synthetiser.effects[id].distortion)
    } else if (id === 'chorus') {
      html += to16(pilot.synthetiser.effects[id].depth)
    } else if (id === 'delay') {
      html += to16(pilot.synthetiser.effects[id].delayTime.value)
    } else if (id === 'feedback') {
      html += to16(pilot.synthetiser.effects[id].delayTime.value)
    } else if (id === 'cheby') {
      html += to16(parseInt(pilot.synthetiser.effects[id].order / 50))
    } else if (data.name === 'tremolo') {
      html += to16(pilot.synthetiser.effects[id].depth)
    } else if (data.name === 'bitcrusher') {
      html += to16(pilot.synthetiser.effects[id].bits)
    } else {
      html += '?'
    }
    html += '</span> '

    for (let i = 0; i < 8; i++) {
      const reach = parseInt(pilot.synthetiser.effects[id].wet.value * 8)
      html += i < reach ? '<span>|</span>' : '.'
    }

    html += ``
    return html
  }

  this.validate = function (value) {
    pilot.synthetiser.run(value)
    this.updateAll()
  }

  // Events

  this.input.oninput = (e) => {

  }

  this.input.onkeypress = (e) => {
    if (e.keyCode !== 13) { return }
    e.preventDefault()
    this.validate(this.input.value)
    this.input.value = ''
  }

  function to16 (float) { return str36(Math.floor(float * 15)) }
  function str36 (int) { return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'][parseInt(int)] }
  function int36 (str) { return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'].indexOf(`${str}`) }
}

module.exports = Terminal