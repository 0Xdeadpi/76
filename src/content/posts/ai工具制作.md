---
title: ai工具制作 记录
published: 2026-03-27
description: 详细的过程记录
tags: [AI]
category: '小白学习'
draft: false
lang: 'zh'
---


***便携式AI语音小助手***（类似迷你Siri或小爱同学），用DeepSeek作为大脑，实现“说一句 → 识别 → AI思考 → 语音回复”。


整体流程可行，功耗也不高（ESP32-S3 + 小喇叭2W基本能用充电宝或电脑Type-C供电）


### 硬件准备：

ESP32-S3-N16R8（开发板）


INMP441（I2S数字麦克风）


MAX98357（I2S音频放大器 + 你的2W 8Ω喇叭）



TP4056（1A充电模块，Type-C输入）


公对公 公对母 杜邦线


