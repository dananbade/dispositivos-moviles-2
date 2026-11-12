import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, ScrollView, Platform, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsistenteIA from '../components/AsistenteIA';

const STORAGE_KEY = '@inventario_equipos_web';
const STORAGE_VERSION_KEY = '@inventario_equipos_web_version';

const DATA_VERSION = '2';

const EQUIPOS_INICIALES = [
  { id: '1', codigo: 'INV-0001', nombre: 'PC Todo en Uno HP 02', ubicacion: 'Bodega', estado: 'Operativo' },
  { id: '2', codigo: 'INV-0002', nombre: 'Firewall Fortinet', ubicacion: 'Recursos Humanos', estado: 'Operativo' },
  { id: '3', codigo: 'INV-0003', nombre: 'Switch 8 puertos', ubicacion: 'Sala de servidores', estado: 'Dado de baja' },
  { id: '4', codigo: 'INV-0004', nombre: 'Laptop Lenovo ThinkPad 05', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '5', codigo: 'INV-0005', nombre: 'Tablet Samsung 06', ubicacion: 'Mesa de ayuda', estado: 'Operativo' },
  { id: '6', codigo: 'INV-0006', nombre: 'PC Escritorio 07', ubicacion: 'Recepción', estado: 'Operativo' },
  { id: '7', codigo: 'INV-0007', nombre: 'Switch 8 puertos', ubicacion: 'Mantenimiento', estado: 'En reparación' },
  { id: '8', codigo: 'INV-0008', nombre: 'PC Escritorio 09', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '9', codigo: 'INV-0009', nombre: 'Cámara IP 10', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '10', codigo: 'INV-0010', nombre: 'Switch 8 puertos', ubicacion: 'Archivo general', estado: 'En reparación' },
  { id: '11', codigo: 'INV-0011', nombre: 'Router Principal', ubicacion: 'Oficina Admin', estado: 'Operativo' },
  { id: '12', codigo: 'INV-0012', nombre: 'Cámara IP 13', ubicacion: 'Mesa de ayuda', estado: 'Operativo' },
  { id: '13', codigo: 'INV-0013', nombre: 'Router Principal', ubicacion: 'Sala de servidores', estado: 'Operativo' },
  { id: '14', codigo: 'INV-0014', nombre: 'Disco duro externo 15', ubicacion: 'Sala de juntas 2', estado: 'Operativo' },
  { id: '15', codigo: 'INV-0015', nombre: 'Laptop HP ProBook 16', ubicacion: 'Auditorio', estado: 'Operativo' },
  { id: '16', codigo: 'INV-0016', nombre: 'Monitor Samsung 27" 17', ubicacion: 'Laboratorio de Sistemas', estado: 'En reparación' },
  { id: '17', codigo: 'INV-0017', nombre: 'Router Principal', ubicacion: 'Soporte Técnico', estado: 'Dado de baja' },
  { id: '18', codigo: 'INV-0018', nombre: 'UPS APC 1500VA', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '19', codigo: 'INV-0019', nombre: 'Telefono IP Cisco 20', ubicacion: 'Auditorio', estado: 'Operativo' },
  { id: '20', codigo: 'INV-0020', nombre: 'Mouse inalámbrico 01', ubicacion: 'Sala de juntas 1', estado: 'Dado de baja' },
  { id: '21', codigo: 'INV-0021', nombre: 'Laptop Asus VivoBook 02', ubicacion: 'Laboratorio de Sistemas', estado: 'En reparación' },
  { id: '22', codigo: 'INV-0022', nombre: 'Switch 24 puertos', ubicacion: 'Recepción', estado: 'Operativo' },
  { id: '23', codigo: 'INV-0023', nombre: 'Impresora de etiquetas Zebra 04', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '24', codigo: 'INV-0024', nombre: 'Laptop HP ProBook 05', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '25', codigo: 'INV-0025', nombre: 'Escáner Canon 06', ubicacion: 'Recursos Humanos', estado: 'Operativo' },
  { id: '26', codigo: 'INV-0026', nombre: 'PC Todo en Uno HP 07', ubicacion: 'Laboratorio de Sistemas', estado: 'Operativo' },
  { id: '27', codigo: 'INV-0027', nombre: 'Monitor Samsung 27" 08', ubicacion: 'Laboratorio de Sistemas', estado: 'Operativo' },
  { id: '28', codigo: 'INV-0028', nombre: 'Impresora de etiquetas Zebra 09', ubicacion: 'Recursos Humanos', estado: 'Dado de baja' },
  { id: '29', codigo: 'INV-0029', nombre: 'Telefono IP Cisco 10', ubicacion: 'Recepción', estado: 'En reparación' },
  { id: '30', codigo: 'INV-0030', nombre: 'PC Todo en Uno HP 11', ubicacion: 'Contabilidad', estado: 'En reparación' },
  { id: '31', codigo: 'INV-0031', nombre: 'Firewall Fortinet', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '32', codigo: 'INV-0032', nombre: 'UPS APC 1500VA', ubicacion: 'Auditorio', estado: 'Operativo' },
  { id: '33', codigo: 'INV-0033', nombre: 'Telefono IP Cisco 14', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '34', codigo: 'INV-0034', nombre: 'Impresora de etiquetas Zebra 15', ubicacion: 'Sala de juntas 2', estado: 'Operativo' },
  { id: '35', codigo: 'INV-0035', nombre: 'Switch 8 puertos', ubicacion: 'Soporte Técnico', estado: 'Operativo' },
  { id: '36', codigo: 'INV-0036', nombre: 'Escáner Canon 17', ubicacion: 'Recursos Humanos', estado: 'Operativo' },
  { id: '37', codigo: 'INV-0037', nombre: 'Switch 24 puertos', ubicacion: 'Piso 2 - Pasillo A', estado: 'Dado de baja' },
  { id: '38', codigo: 'INV-0038', nombre: 'Monitor LG 24" 19', ubicacion: 'Ventas', estado: 'Dado de baja' },
  { id: '39', codigo: 'INV-0039', nombre: 'Proyector Epson 20', ubicacion: 'Auditorio', estado: 'Dado de baja' },
  { id: '40', codigo: 'INV-0040', nombre: 'UPS APC 1500VA', ubicacion: 'Sala de servidores', estado: 'Operativo' },
  { id: '41', codigo: 'INV-0041', nombre: 'Impresora HP LaserJet 02', ubicacion: 'Gerencia', estado: 'Dado de baja' },
  { id: '42', codigo: 'INV-0042', nombre: 'Mouse inalámbrico 03', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '43', codigo: 'INV-0043', nombre: 'Firewall Fortinet', ubicacion: 'Piso 2 - Pasillo A', estado: 'Operativo' },
  { id: '44', codigo: 'INV-0044', nombre: 'Lector de código de barras 05', ubicacion: 'Piso 2 - Pasillo A', estado: 'Operativo' },
  { id: '45', codigo: 'INV-0045', nombre: 'Monitor Samsung 27" 06', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '46', codigo: 'INV-0046', nombre: 'Teclado Logitech 07', ubicacion: 'Cafetería', estado: 'Operativo' },
  { id: '47', codigo: 'INV-0047', nombre: 'Disco duro externo 08', ubicacion: 'Soporte Técnico', estado: 'Operativo' },
  { id: '48', codigo: 'INV-0048', nombre: 'Impresora HP LaserJet 09', ubicacion: 'Contabilidad', estado: 'Dado de baja' },
  { id: '49', codigo: 'INV-0049', nombre: 'Servidor Dell PowerEdge', ubicacion: 'Piso 3 - Pasillo B', estado: 'Operativo' },
  { id: '50', codigo: 'INV-0050', nombre: 'Escáner Canon 11', ubicacion: 'Auditorio', estado: 'En reparación' },
  { id: '51', codigo: 'INV-0051', nombre: 'UPS APC 1500VA', ubicacion: 'Mantenimiento', estado: 'Operativo' },
  { id: '52', codigo: 'INV-0052', nombre: 'Mouse inalámbrico 13', ubicacion: 'Oficina Admin', estado: 'Dado de baja' },
  { id: '53', codigo: 'INV-0053', nombre: 'Firewall Fortinet', ubicacion: 'Bodega', estado: 'Dado de baja' },
  { id: '54', codigo: 'INV-0054', nombre: 'Lector de código de barras 15', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '55', codigo: 'INV-0055', nombre: 'Disco duro externo 16', ubicacion: 'Sala de juntas 2', estado: 'Operativo' },
  { id: '56', codigo: 'INV-0056', nombre: 'Access Point', ubicacion: 'Mesa de ayuda', estado: 'Operativo' },
  { id: '57', codigo: 'INV-0057', nombre: 'UPS APC 1500VA', ubicacion: 'Oficina Admin', estado: 'Dado de baja' },
  { id: '58', codigo: 'INV-0058', nombre: 'Lector de código de barras 19', ubicacion: 'Recursos Humanos', estado: 'En reparación' },
  { id: '59', codigo: 'INV-0059', nombre: 'Disco duro externo 20', ubicacion: 'Contabilidad', estado: 'En reparación' },
  { id: '60', codigo: 'INV-0060', nombre: 'Telefono IP Cisco 01', ubicacion: 'Bodega', estado: 'Dado de baja' },
  { id: '61', codigo: 'INV-0061', nombre: 'Access Point', ubicacion: 'Mantenimiento', estado: 'En reparación' },
  { id: '62', codigo: 'INV-0062', nombre: 'Switch 24 puertos', ubicacion: 'Sala de servidores', estado: 'Operativo' },
  { id: '63', codigo: 'INV-0063', nombre: 'Disco duro externo 04', ubicacion: 'Contabilidad', estado: 'En reparación' },
  { id: '64', codigo: 'INV-0064', nombre: 'Disco duro externo 05', ubicacion: 'Mantenimiento', estado: 'Operativo' },
  { id: '65', codigo: 'INV-0065', nombre: 'Laptop Asus VivoBook 06', ubicacion: 'Sala de juntas 2', estado: 'Operativo' },
  { id: '66', codigo: 'INV-0066', nombre: 'PC Escritorio 07', ubicacion: 'Bodega', estado: 'Operativo' },
  { id: '67', codigo: 'INV-0067', nombre: 'Lector de código de barras 08', ubicacion: 'Sala de juntas 1', estado: 'Operativo' },
  { id: '68', codigo: 'INV-0068', nombre: 'Laptop Dell 09', ubicacion: 'Gerencia', estado: 'En reparación' },
  { id: '69', codigo: 'INV-0069', nombre: 'Laptop HP ProBook 10', ubicacion: 'Recepción', estado: 'Dado de baja' },
  { id: '70', codigo: 'INV-0070', nombre: 'Proyector Epson 11', ubicacion: 'Recepción', estado: 'En reparación' },
  { id: '71', codigo: 'INV-0071', nombre: 'Disco duro externo 12', ubicacion: 'Sala de servidores', estado: 'Operativo' },
  { id: '72', codigo: 'INV-0072', nombre: 'Impresora de etiquetas Zebra 13', ubicacion: 'Cafetería', estado: 'En reparación' },
  { id: '73', codigo: 'INV-0073', nombre: 'Impresora Multifuncional Epson 14', ubicacion: 'Recursos Humanos', estado: 'En reparación' },
  { id: '74', codigo: 'INV-0074', nombre: 'Parlante de conferencia 15', ubicacion: 'Piso 3 - Pasillo B', estado: 'Operativo' },
  { id: '75', codigo: 'INV-0075', nombre: 'Switch 24 puertos', ubicacion: 'Almacén 2', estado: 'Dado de baja' },
  { id: '76', codigo: 'INV-0076', nombre: 'Cámara IP 17', ubicacion: 'Ventas', estado: 'Dado de baja' },
  { id: '77', codigo: 'INV-0077', nombre: 'Access Point', ubicacion: 'Auditorio', estado: 'Dado de baja' },
  { id: '78', codigo: 'INV-0078', nombre: 'PC Todo en Uno HP 19', ubicacion: 'Laboratorio de Sistemas', estado: 'Operativo' },
  { id: '79', codigo: 'INV-0079', nombre: 'Lector de código de barras 20', ubicacion: 'Mantenimiento', estado: 'Operativo' },
  { id: '80', codigo: 'INV-0080', nombre: 'Laptop Lenovo ThinkPad 01', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '81', codigo: 'INV-0081', nombre: 'Laptop HP ProBook 02', ubicacion: 'Sala de juntas 2', estado: 'Operativo' },
  { id: '82', codigo: 'INV-0082', nombre: 'Tablet Samsung 03', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '83', codigo: 'INV-0083', nombre: 'Tablet Samsung 04', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '84', codigo: 'INV-0084', nombre: 'Laptop HP ProBook 05', ubicacion: 'Soporte Técnico', estado: 'Operativo' },
  { id: '85', codigo: 'INV-0085', nombre: 'Laptop HP ProBook 06', ubicacion: 'Soporte Técnico', estado: 'Operativo' },
  { id: '86', codigo: 'INV-0086', nombre: 'Laptop HP ProBook 07', ubicacion: 'Mantenimiento', estado: 'Operativo' },
  { id: '87', codigo: 'INV-0087', nombre: 'Router Principal', ubicacion: 'Cafetería', estado: 'Operativo' },
  { id: '88', codigo: 'INV-0088', nombre: 'Mouse inalámbrico 09', ubicacion: 'Sala de servidores', estado: 'Dado de baja' },
  { id: '89', codigo: 'INV-0089', nombre: 'Telefono IP Cisco 10', ubicacion: 'Piso 2 - Pasillo A', estado: 'En reparación' },
  { id: '90', codigo: 'INV-0090', nombre: 'Proyector Epson 11', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '91', codigo: 'INV-0091', nombre: 'Webcam Logitech 12', ubicacion: 'Mesa de ayuda', estado: 'Operativo' },
  { id: '92', codigo: 'INV-0092', nombre: 'Laptop Lenovo ThinkPad 13', ubicacion: 'Bodega', estado: 'Dado de baja' },
  { id: '93', codigo: 'INV-0093', nombre: 'Servidor Dell PowerEdge', ubicacion: 'Laboratorio de Sistemas', estado: 'Operativo' },
  { id: '94', codigo: 'INV-0094', nombre: 'Servidor Dell PowerEdge', ubicacion: 'Archivo general', estado: 'Dado de baja' },
  { id: '95', codigo: 'INV-0095', nombre: 'Laptop Dell 16', ubicacion: 'Bodega', estado: 'Operativo' },
  { id: '96', codigo: 'INV-0096', nombre: 'Escáner Canon 17', ubicacion: 'Sala de juntas 2', estado: 'Operativo' },
  { id: '97', codigo: 'INV-0097', nombre: 'Switch 8 puertos', ubicacion: 'Ventas', estado: 'Operativo' },
  { id: '98', codigo: 'INV-0098', nombre: 'Mouse inalámbrico 19', ubicacion: 'Archivo general', estado: 'Operativo' },
  { id: '99', codigo: 'INV-0099', nombre: 'Servidor Dell PowerEdge', ubicacion: 'Contabilidad', estado: 'Operativo' },
  { id: '100', codigo: 'INV-0100', nombre: 'UPS APC 1500VA', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '101', codigo: 'INV-0101', nombre: 'UPS APC 1500VA', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '102', codigo: 'INV-0102', nombre: 'Laptop Dell 03', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '103', codigo: 'INV-0103', nombre: 'Laptop HP ProBook 04', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '104', codigo: 'INV-0104', nombre: 'Servidor Dell PowerEdge', ubicacion: 'Cafetería', estado: 'Operativo' },
  { id: '105', codigo: 'INV-0105', nombre: 'Switch 24 puertos', ubicacion: 'Auditorio', estado: 'Operativo' },
  { id: '106', codigo: 'INV-0106', nombre: 'Impresora Multifuncional Epson 07', ubicacion: 'Auditorio', estado: 'Operativo' },
  { id: '107', codigo: 'INV-0107', nombre: 'Escáner Canon 08', ubicacion: 'Recursos Humanos', estado: 'Operativo' },
  { id: '108', codigo: 'INV-0108', nombre: 'Access Point', ubicacion: 'Mesa de ayuda', estado: 'Dado de baja' },
  { id: '109', codigo: 'INV-0109', nombre: 'Firewall Fortinet', ubicacion: 'Almacén 2', estado: 'Dado de baja' },
  { id: '110', codigo: 'INV-0110', nombre: 'Cámara IP 11', ubicacion: 'Cafetería', estado: 'Operativo' },
  { id: '111', codigo: 'INV-0111', nombre: 'Switch 24 puertos', ubicacion: 'Sala de juntas 1', estado: 'Operativo' },
  { id: '112', codigo: 'INV-0112', nombre: 'Laptop Dell 13', ubicacion: 'Piso 2 - Pasillo A', estado: 'Dado de baja' },
  { id: '113', codigo: 'INV-0113', nombre: 'Mouse inalámbrico 14', ubicacion: 'Soporte Técnico', estado: 'Dado de baja' },
  { id: '114', codigo: 'INV-0114', nombre: 'Monitor LG 24" 15', ubicacion: 'Soporte Técnico', estado: 'Operativo' },
  { id: '115', codigo: 'INV-0115', nombre: 'Tablet Samsung 16', ubicacion: 'Cafetería', estado: 'En reparación' },
  { id: '116', codigo: 'INV-0116', nombre: 'Telefono IP Cisco 17', ubicacion: 'Mantenimiento', estado: 'Operativo' },
  { id: '117', codigo: 'INV-0117', nombre: 'Laptop Dell 18', ubicacion: 'Mantenimiento', estado: 'Operativo' },
  { id: '118', codigo: 'INV-0118', nombre: 'Parlante de conferencia 19', ubicacion: 'Contabilidad', estado: 'Operativo' },
  { id: '119', codigo: 'INV-0119', nombre: 'Laptop Asus VivoBook 20', ubicacion: 'Recepción', estado: 'Dado de baja' },
  { id: '120', codigo: 'INV-0120', nombre: 'Parlante de conferencia 01', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '121', codigo: 'INV-0121', nombre: 'Laptop Lenovo ThinkPad 02', ubicacion: 'Piso 2 - Pasillo A', estado: 'Operativo' },
  { id: '122', codigo: 'INV-0122', nombre: 'Tablet Samsung 03', ubicacion: 'Piso 3 - Pasillo B', estado: 'Operativo' },
  { id: '123', codigo: 'INV-0123', nombre: 'Laptop Asus VivoBook 04', ubicacion: 'Recepción', estado: 'Operativo' },
  { id: '124', codigo: 'INV-0124', nombre: 'Impresora de etiquetas Zebra 05', ubicacion: 'Piso 2 - Pasillo A', estado: 'En reparación' },
  { id: '125', codigo: 'INV-0125', nombre: 'Teclado Logitech 06', ubicacion: 'Sala de juntas 2', estado: 'Operativo' },
  { id: '126', codigo: 'INV-0126', nombre: 'Switch 24 puertos', ubicacion: 'Sala de juntas 2', estado: 'Operativo' },
  { id: '127', codigo: 'INV-0127', nombre: 'Router Principal', ubicacion: 'Auditorio', estado: 'Operativo' },
  { id: '128', codigo: 'INV-0128', nombre: 'Impresora de etiquetas Zebra 09', ubicacion: 'Sala de juntas 1', estado: 'Operativo' },
  { id: '129', codigo: 'INV-0129', nombre: 'Monitor LG 24" 10', ubicacion: 'Recepción', estado: 'Operativo' },
  { id: '130', codigo: 'INV-0130', nombre: 'UPS APC 1500VA', ubicacion: 'Piso 3 - Pasillo B', estado: 'En reparación' },
  { id: '131', codigo: 'INV-0131', nombre: 'Laptop Lenovo ThinkPad 12', ubicacion: 'Recepción', estado: 'En reparación' },
  { id: '132', codigo: 'INV-0132', nombre: 'Switch 24 puertos', ubicacion: 'Mantenimiento', estado: 'Operativo' },
  { id: '133', codigo: 'INV-0133', nombre: 'Impresora HP LaserJet 14', ubicacion: 'Laboratorio de Sistemas', estado: 'Operativo' },
  { id: '134', codigo: 'INV-0134', nombre: 'Lector de código de barras 15', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '135', codigo: 'INV-0135', nombre: 'Access Point', ubicacion: 'Contabilidad', estado: 'Operativo' },
  { id: '136', codigo: 'INV-0136', nombre: 'Micrófono de conferencia 17', ubicacion: 'Almacén 2', estado: 'Dado de baja' },
  { id: '137', codigo: 'INV-0137', nombre: 'Access Point', ubicacion: 'Piso 3 - Pasillo B', estado: 'Dado de baja' },
  { id: '138', codigo: 'INV-0138', nombre: 'Teclado Logitech 19', ubicacion: 'Oficina Admin', estado: 'Dado de baja' },
  { id: '139', codigo: 'INV-0139', nombre: 'Micrófono de conferencia 20', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '140', codigo: 'INV-0140', nombre: 'Telefono IP Cisco 01', ubicacion: 'Bodega', estado: 'Operativo' },
  { id: '141', codigo: 'INV-0141', nombre: 'Router Principal', ubicacion: 'Bodega', estado: 'Operativo' },
  { id: '142', codigo: 'INV-0142', nombre: 'Firewall Fortinet', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '143', codigo: 'INV-0143', nombre: 'Router Principal', ubicacion: 'Sala de juntas 1', estado: 'En reparación' },
  { id: '144', codigo: 'INV-0144', nombre: 'Switch 24 puertos', ubicacion: 'Sala de juntas 2', estado: 'Operativo' },
  { id: '145', codigo: 'INV-0145', nombre: 'Impresora de etiquetas Zebra 06', ubicacion: 'Recursos Humanos', estado: 'En reparación' },
  { id: '146', codigo: 'INV-0146', nombre: 'Proyector Epson 07', ubicacion: 'Recursos Humanos', estado: 'Operativo' },
  { id: '147', codigo: 'INV-0147', nombre: 'Laptop HP ProBook 08', ubicacion: 'Mesa de ayuda', estado: 'Operativo' },
  { id: '148', codigo: 'INV-0148', nombre: 'Laptop Dell 09', ubicacion: 'Oficina Admin', estado: 'Operativo' },
  { id: '149', codigo: 'INV-0149', nombre: 'Disco duro externo 10', ubicacion: 'Sala de servidores', estado: 'Dado de baja' },
  { id: '150', codigo: 'INV-0150', nombre: 'Router Principal', ubicacion: 'Contabilidad', estado: 'Dado de baja' },
  { id: '151', codigo: 'INV-0151', nombre: 'UPS APC 1500VA', ubicacion: 'Almacén 2', estado: 'Dado de baja' },
  { id: '152', codigo: 'INV-0152', nombre: 'Servidor Dell PowerEdge', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '153', codigo: 'INV-0153', nombre: 'Laptop Lenovo ThinkPad 14', ubicacion: 'Recepción', estado: 'Dado de baja' },
  { id: '154', codigo: 'INV-0154', nombre: 'Lector de código de barras 15', ubicacion: 'Sala de servidores', estado: 'En reparación' },
  { id: '155', codigo: 'INV-0155', nombre: 'Laptop Dell 16', ubicacion: 'Laboratorio de Sistemas', estado: 'En reparación' },
  { id: '156', codigo: 'INV-0156', nombre: 'Mouse inalámbrico 17', ubicacion: 'Sala de servidores', estado: 'Operativo' },
  { id: '157', codigo: 'INV-0157', nombre: 'Impresora HP LaserJet 18', ubicacion: 'Soporte Técnico', estado: 'Operativo' },
  { id: '158', codigo: 'INV-0158', nombre: 'Monitor Samsung 27" 19', ubicacion: 'Soporte Técnico', estado: 'Operativo' },
  { id: '159', codigo: 'INV-0159', nombre: 'Switch 24 puertos', ubicacion: 'Gerencia', estado: 'Dado de baja' },
  { id: '160', codigo: 'INV-0160', nombre: 'Laptop Lenovo ThinkPad 01', ubicacion: 'Laboratorio de Sistemas', estado: 'En reparación' },
  { id: '161', codigo: 'INV-0161', nombre: 'Lector de código de barras 02', ubicacion: 'Mesa de ayuda', estado: 'En reparación' },
  { id: '162', codigo: 'INV-0162', nombre: 'Firewall Fortinet', ubicacion: 'Sala de servidores', estado: 'Operativo' },
  { id: '163', codigo: 'INV-0163', nombre: 'Parlante de conferencia 04', ubicacion: 'Contabilidad', estado: 'Operativo' },
  { id: '164', codigo: 'INV-0164', nombre: 'Lector de código de barras 05', ubicacion: 'Mesa de ayuda', estado: 'Operativo' },
  { id: '165', codigo: 'INV-0165', nombre: 'Impresora Multifuncional Epson 06', ubicacion: 'Sala de juntas 2', estado: 'Operativo' },
  { id: '166', codigo: 'INV-0166', nombre: 'Webcam Logitech 07', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '167', codigo: 'INV-0167', nombre: 'Impresora Multifuncional Epson 08', ubicacion: 'Bodega', estado: 'Operativo' },
  { id: '168', codigo: 'INV-0168', nombre: 'Parlante de conferencia 09', ubicacion: 'Soporte Técnico', estado: 'Operativo' },
  { id: '169', codigo: 'INV-0169', nombre: 'Switch 8 puertos', ubicacion: 'Ventas', estado: 'Operativo' },
  { id: '170', codigo: 'INV-0170', nombre: 'Monitor Samsung 27" 11', ubicacion: 'Sala de juntas 1', estado: 'Operativo' },
  { id: '171', codigo: 'INV-0171', nombre: 'Switch 8 puertos', ubicacion: 'Oficina Admin', estado: 'Dado de baja' },
  { id: '172', codigo: 'INV-0172', nombre: 'Switch 24 puertos', ubicacion: 'Auditorio', estado: 'Operativo' },
  { id: '173', codigo: 'INV-0173', nombre: 'Router Principal', ubicacion: 'Recepción', estado: 'Operativo' },
  { id: '174', codigo: 'INV-0174', nombre: 'Monitor Samsung 27" 15', ubicacion: 'Mantenimiento', estado: 'Operativo' },
  { id: '175', codigo: 'INV-0175', nombre: 'Impresora de etiquetas Zebra 16', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '176', codigo: 'INV-0176', nombre: 'PC Escritorio 17', ubicacion: 'Bodega', estado: 'Operativo' },
  { id: '177', codigo: 'INV-0177', nombre: 'Impresora Multifuncional Epson 18', ubicacion: 'Piso 2 - Pasillo A', estado: 'Operativo' },
  { id: '178', codigo: 'INV-0178', nombre: 'Laptop Dell 19', ubicacion: 'Bodega', estado: 'En reparación' },
  { id: '179', codigo: 'INV-0179', nombre: 'Servidor Dell PowerEdge', ubicacion: 'Laboratorio de Sistemas', estado: 'Dado de baja' },
  { id: '180', codigo: 'INV-0180', nombre: 'Webcam Logitech 01', ubicacion: 'Sala de juntas 2', estado: 'Operativo' },
  { id: '181', codigo: 'INV-0181', nombre: 'Laptop Asus VivoBook 02', ubicacion: 'Mantenimiento', estado: 'Operativo' },
  { id: '182', codigo: 'INV-0182', nombre: 'Escáner Canon 03', ubicacion: 'Piso 2 - Pasillo A', estado: 'Operativo' },
  { id: '183', codigo: 'INV-0183', nombre: 'Router Principal', ubicacion: 'Soporte Técnico', estado: 'Dado de baja' },
  { id: '184', codigo: 'INV-0184', nombre: 'Servidor Dell PowerEdge', ubicacion: 'Oficina Admin', estado: 'En reparación' },
  { id: '185', codigo: 'INV-0185', nombre: 'Telefono IP Cisco 06', ubicacion: 'Almacén 2', estado: 'Dado de baja' },
  { id: '186', codigo: 'INV-0186', nombre: 'Firewall Fortinet', ubicacion: 'Ventas', estado: 'Operativo' },
  { id: '187', codigo: 'INV-0187', nombre: 'Servidor Dell PowerEdge', ubicacion: 'Recepción', estado: 'Dado de baja' },
  { id: '188', codigo: 'INV-0188', nombre: 'Telefono IP Cisco 09', ubicacion: 'Sala de juntas 2', estado: 'En reparación' },
  { id: '189', codigo: 'INV-0189', nombre: 'Monitor LG 24" 10', ubicacion: 'Bodega', estado: 'Dado de baja' },
  { id: '190', codigo: 'INV-0190', nombre: 'Lector de código de barras 11', ubicacion: 'Sala de juntas 1', estado: 'En reparación' },
  { id: '191', codigo: 'INV-0191', nombre: 'Access Point', ubicacion: 'Mesa de ayuda', estado: 'Operativo' },
  { id: '192', codigo: 'INV-0192', nombre: 'Escáner Canon 13', ubicacion: 'Sala de juntas 1', estado: 'En reparación' },
  { id: '193', codigo: 'INV-0193', nombre: 'Impresora HP LaserJet 14', ubicacion: 'Ventas', estado: 'Operativo' },
  { id: '194', codigo: 'INV-0194', nombre: 'Impresora de etiquetas Zebra 15', ubicacion: 'Auditorio', estado: 'Dado de baja' },
  { id: '195', codigo: 'INV-0195', nombre: 'Firewall Fortinet', ubicacion: 'Contabilidad', estado: 'En reparación' },
  { id: '196', codigo: 'INV-0196', nombre: 'Tablet Samsung 17', ubicacion: 'Sala de juntas 1', estado: 'Operativo' },
  { id: '197', codigo: 'INV-0197', nombre: 'Mouse inalámbrico 18', ubicacion: 'Oficina Admin', estado: 'Operativo' },
  { id: '198', codigo: 'INV-0198', nombre: 'Access Point', ubicacion: 'Ventas', estado: 'Operativo' },
  { id: '199', codigo: 'INV-0199', nombre: 'Webcam Logitech 20', ubicacion: 'Piso 2 - Pasillo A', estado: 'En reparación' },
  { id: '200', codigo: 'INV-0200', nombre: 'PC Todo en Uno HP 01', ubicacion: 'Sala de juntas 2', estado: 'Operativo' },
  { id: '201', codigo: 'INV-0201', nombre: 'UPS APC 1500VA', ubicacion: 'Archivo general', estado: 'Dado de baja' },
  { id: '202', codigo: 'INV-0202', nombre: 'Switch 24 puertos', ubicacion: 'Mantenimiento', estado: 'Operativo' },
  { id: '203', codigo: 'INV-0203', nombre: 'Webcam Logitech 04', ubicacion: 'Contabilidad', estado: 'Dado de baja' },
  { id: '204', codigo: 'INV-0204', nombre: 'Laptop HP ProBook 05', ubicacion: 'Sala de juntas 1', estado: 'En reparación' },
  { id: '205', codigo: 'INV-0205', nombre: 'Impresora de etiquetas Zebra 06', ubicacion: 'Piso 3 - Pasillo B', estado: 'Operativo' },
  { id: '206', codigo: 'INV-0206', nombre: 'Laptop HP ProBook 07', ubicacion: 'Gerencia', estado: 'Dado de baja' },
  { id: '207', codigo: 'INV-0207', nombre: 'Access Point', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '208', codigo: 'INV-0208', nombre: 'Impresora HP LaserJet 09', ubicacion: 'Oficina Admin', estado: 'Operativo' },
  { id: '209', codigo: 'INV-0209', nombre: 'Switch 8 puertos', ubicacion: 'Cafetería', estado: 'En reparación' },
  { id: '210', codigo: 'INV-0210', nombre: 'Parlante de conferencia 11', ubicacion: 'Recepción', estado: 'Operativo' },
  { id: '211', codigo: 'INV-0211', nombre: 'Servidor Dell PowerEdge', ubicacion: 'Piso 2 - Pasillo A', estado: 'Operativo' },
  { id: '212', codigo: 'INV-0212', nombre: 'Cámara IP 13', ubicacion: 'Auditorio', estado: 'Operativo' },
  { id: '213', codigo: 'INV-0213', nombre: 'Escáner Canon 14', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '214', codigo: 'INV-0214', nombre: 'PC Todo en Uno HP 15', ubicacion: 'Oficina Admin', estado: 'Operativo' },
  { id: '215', codigo: 'INV-0215', nombre: 'Disco duro externo 16', ubicacion: 'Mesa de ayuda', estado: 'Operativo' },
  { id: '216', codigo: 'INV-0216', nombre: 'Impresora Multifuncional Epson 17', ubicacion: 'Mantenimiento', estado: 'Operativo' },
  { id: '217', codigo: 'INV-0217', nombre: 'Laptop Dell 18', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '218', codigo: 'INV-0218', nombre: 'Telefono IP Cisco 19', ubicacion: 'Bodega', estado: 'Operativo' },
  { id: '219', codigo: 'INV-0219', nombre: 'Impresora HP LaserJet 20', ubicacion: 'Archivo general', estado: 'Dado de baja' },
  { id: '220', codigo: 'INV-0220', nombre: 'Teclado Logitech 01', ubicacion: 'Almacén 2', estado: 'En reparación' },
  { id: '221', codigo: 'INV-0221', nombre: 'Monitor LG 24" 02', ubicacion: 'Archivo general', estado: 'En reparación' },
  { id: '222', codigo: 'INV-0222', nombre: 'Micrófono de conferencia 03', ubicacion: 'Mantenimiento', estado: 'Operativo' },
  { id: '223', codigo: 'INV-0223', nombre: 'Micrófono de conferencia 04', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '224', codigo: 'INV-0224', nombre: 'Lector de código de barras 05', ubicacion: 'Contabilidad', estado: 'Dado de baja' },
  { id: '225', codigo: 'INV-0225', nombre: 'Parlante de conferencia 06', ubicacion: 'Cafetería', estado: 'Operativo' },
  { id: '226', codigo: 'INV-0226', nombre: 'Router Principal', ubicacion: 'Gerencia', estado: 'Dado de baja' },
  { id: '227', codigo: 'INV-0227', nombre: 'Router Principal', ubicacion: 'Mantenimiento', estado: 'Operativo' },
  { id: '228', codigo: 'INV-0228', nombre: 'PC Todo en Uno HP 09', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '229', codigo: 'INV-0229', nombre: 'UPS APC 1500VA', ubicacion: 'Recepción', estado: 'Dado de baja' },
  { id: '230', codigo: 'INV-0230', nombre: 'Access Point', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '231', codigo: 'INV-0231', nombre: 'Monitor LG 24" 12', ubicacion: 'Sala de juntas 2', estado: 'En reparación' },
  { id: '232', codigo: 'INV-0232', nombre: 'Laptop HP ProBook 13', ubicacion: 'Sala de servidores', estado: 'Operativo' },
  { id: '233', codigo: 'INV-0233', nombre: 'Switch 8 puertos', ubicacion: 'Auditorio', estado: 'Dado de baja' },
  { id: '234', codigo: 'INV-0234', nombre: 'Impresora HP LaserJet 15', ubicacion: 'Ventas', estado: 'Operativo' },
  { id: '235', codigo: 'INV-0235', nombre: 'Servidor Dell PowerEdge', ubicacion: 'Mesa de ayuda', estado: 'Operativo' },
  { id: '236', codigo: 'INV-0236', nombre: 'Mouse inalámbrico 17', ubicacion: 'Archivo general', estado: 'Operativo' },
  { id: '237', codigo: 'INV-0237', nombre: 'Laptop Dell 18', ubicacion: 'Ventas', estado: 'Operativo' },
  { id: '238', codigo: 'INV-0238', nombre: 'Escáner Canon 19', ubicacion: 'Piso 2 - Pasillo A', estado: 'Dado de baja' },
  { id: '239', codigo: 'INV-0239', nombre: 'PC Escritorio 20', ubicacion: 'Piso 2 - Pasillo A', estado: 'Operativo' },
  { id: '240', codigo: 'INV-0240', nombre: 'Proyector Epson 01', ubicacion: 'Oficina Admin', estado: 'Operativo' },
  { id: '241', codigo: 'INV-0241', nombre: 'Access Point', ubicacion: 'Auditorio', estado: 'Operativo' },
  { id: '242', codigo: 'INV-0242', nombre: 'Mouse inalámbrico 03', ubicacion: 'Almacén 2', estado: 'En reparación' },
  { id: '243', codigo: 'INV-0243', nombre: 'Lector de código de barras 04', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '244', codigo: 'INV-0244', nombre: 'Switch 8 puertos', ubicacion: 'Recursos Humanos', estado: 'Operativo' },
  { id: '245', codigo: 'INV-0245', nombre: 'Proyector Epson 06', ubicacion: 'Oficina Admin', estado: 'Operativo' },
  { id: '246', codigo: 'INV-0246', nombre: 'Monitor LG 24" 07', ubicacion: 'Auditorio', estado: 'Dado de baja' },
  { id: '247', codigo: 'INV-0247', nombre: 'Impresora Multifuncional Epson 08', ubicacion: 'Archivo general', estado: 'Operativo' },
  { id: '248', codigo: 'INV-0248', nombre: 'Laptop Asus VivoBook 09', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '249', codigo: 'INV-0249', nombre: 'Telefono IP Cisco 10', ubicacion: 'Auditorio', estado: 'En reparación' },
  { id: '250', codigo: 'INV-0250', nombre: 'Tablet Samsung 11', ubicacion: 'Oficina Admin', estado: 'Operativo' },
  { id: '251', codigo: 'INV-0251', nombre: 'PC Todo en Uno HP 12', ubicacion: 'Mesa de ayuda', estado: 'Operativo' },
  { id: '252', codigo: 'INV-0252', nombre: 'Parlante de conferencia 13', ubicacion: 'Archivo general', estado: 'Operativo' },
  { id: '253', codigo: 'INV-0253', nombre: 'Laptop Dell 14', ubicacion: 'Recursos Humanos', estado: 'Operativo' },
  { id: '254', codigo: 'INV-0254', nombre: 'Monitor LG 24" 15', ubicacion: 'Ventas', estado: 'Operativo' },
  { id: '255', codigo: 'INV-0255', nombre: 'Monitor LG 24" 16', ubicacion: 'Sala de juntas 2', estado: 'Operativo' },
  { id: '256', codigo: 'INV-0256', nombre: 'Router Principal', ubicacion: 'Mesa de ayuda', estado: 'Operativo' },
  { id: '257', codigo: 'INV-0257', nombre: 'Micrófono de conferencia 18', ubicacion: 'Recepción', estado: 'Operativo' },
  { id: '258', codigo: 'INV-0258', nombre: 'PC Escritorio 19', ubicacion: 'Almacén 2', estado: 'Operativo' },
  { id: '259', codigo: 'INV-0259', nombre: 'Monitor Samsung 27" 20', ubicacion: 'Gerencia', estado: 'Dado de baja' },
  { id: '260', codigo: 'INV-0260', nombre: 'Laptop HP ProBook 01', ubicacion: 'Soporte Técnico', estado: 'Operativo' },
  { id: '261', codigo: 'INV-0261', nombre: 'Switch 8 puertos', ubicacion: 'Ventas', estado: 'Operativo' },
  { id: '262', codigo: 'INV-0262', nombre: 'Laptop Asus VivoBook 03', ubicacion: 'Sala de servidores', estado: 'Operativo' },
  { id: '263', codigo: 'INV-0263', nombre: 'Impresora HP LaserJet 04', ubicacion: 'Cafetería', estado: 'Dado de baja' },
  { id: '264', codigo: 'INV-0264', nombre: 'Laptop Lenovo ThinkPad 05', ubicacion: 'Piso 2 - Pasillo A', estado: 'Operativo' },
  { id: '265', codigo: 'INV-0265', nombre: 'UPS APC 1500VA', ubicacion: 'Recursos Humanos', estado: 'Operativo' },
  { id: '266', codigo: 'INV-0266', nombre: 'Impresora Multifuncional Epson 07', ubicacion: 'Piso 3 - Pasillo B', estado: 'En reparación' },
  { id: '267', codigo: 'INV-0267', nombre: 'Firewall Fortinet', ubicacion: 'Bodega', estado: 'Operativo' },
  { id: '268', codigo: 'INV-0268', nombre: 'Access Point', ubicacion: 'Bodega', estado: 'En reparación' },
  { id: '269', codigo: 'INV-0269', nombre: 'PC Escritorio 10', ubicacion: 'Sala de juntas 1', estado: 'En reparación' },
  { id: '270', codigo: 'INV-0270', nombre: 'Impresora de etiquetas Zebra 11', ubicacion: 'Auditorio', estado: 'Operativo' },
  { id: '271', codigo: 'INV-0271', nombre: 'Cámara IP 12', ubicacion: 'Ventas', estado: 'Operativo' },
  { id: '272', codigo: 'INV-0272', nombre: 'Tablet Samsung 13', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '273', codigo: 'INV-0273', nombre: 'Cámara IP 14', ubicacion: 'Sala de juntas 1', estado: 'Dado de baja' },
  { id: '274', codigo: 'INV-0274', nombre: 'Laptop Asus VivoBook 15', ubicacion: 'Bodega', estado: 'En reparación' },
  { id: '275', codigo: 'INV-0275', nombre: 'Webcam Logitech 16', ubicacion: 'Soporte Técnico', estado: 'Operativo' },
  { id: '276', codigo: 'INV-0276', nombre: 'Mouse inalámbrico 17', ubicacion: 'Mesa de ayuda', estado: 'Dado de baja' },
  { id: '277', codigo: 'INV-0277', nombre: 'Monitor Samsung 27" 18', ubicacion: 'Recepción', estado: 'En reparación' },
  { id: '278', codigo: 'INV-0278', nombre: 'PC Todo en Uno HP 19', ubicacion: 'Sala de juntas 2', estado: 'Operativo' },
  { id: '279', codigo: 'INV-0279', nombre: 'Parlante de conferencia 20', ubicacion: 'Mesa de ayuda', estado: 'Operativo' },
  { id: '280', codigo: 'INV-0280', nombre: 'Laptop Lenovo ThinkPad 01', ubicacion: 'Mesa de ayuda', estado: 'Operativo' },
  { id: '281', codigo: 'INV-0281', nombre: 'PC Todo en Uno HP 02', ubicacion: 'Archivo general', estado: 'Dado de baja' },
  { id: '282', codigo: 'INV-0282', nombre: 'Impresora HP LaserJet 03', ubicacion: 'Mesa de ayuda', estado: 'Operativo' },
  { id: '283', codigo: 'INV-0283', nombre: 'Firewall Fortinet', ubicacion: 'Mantenimiento', estado: 'Dado de baja' },
  { id: '284', codigo: 'INV-0284', nombre: 'Router Principal', ubicacion: 'Piso 3 - Pasillo B', estado: 'En reparación' },
  { id: '285', codigo: 'INV-0285', nombre: 'Disco duro externo 06', ubicacion: 'Cafetería', estado: 'Operativo' },
  { id: '286', codigo: 'INV-0286', nombre: 'Servidor Dell PowerEdge', ubicacion: 'Piso 2 - Pasillo A', estado: 'Operativo' },
  { id: '287', codigo: 'INV-0287', nombre: 'Monitor LG 24" 08', ubicacion: 'Gerencia', estado: 'Operativo' },
  { id: '288', codigo: 'INV-0288', nombre: 'Router Principal', ubicacion: 'Archivo general', estado: 'Operativo' },
  { id: '289', codigo: 'INV-0289', nombre: 'Disco duro externo 10', ubicacion: 'Archivo general', estado: 'En reparación' },
  { id: '290', codigo: 'INV-0290', nombre: 'Laptop Asus VivoBook 11', ubicacion: 'Auditorio', estado: 'Operativo' },
  { id: '291', codigo: 'INV-0291', nombre: 'PC Escritorio 12', ubicacion: 'Cafetería', estado: 'Operativo' },
  { id: '292', codigo: 'INV-0292', nombre: 'Impresora Multifuncional Epson 13', ubicacion: 'Cafetería', estado: 'Operativo' },
  { id: '293', codigo: 'INV-0293', nombre: 'Monitor Samsung 27" 14', ubicacion: 'Recursos Humanos', estado: 'Operativo' },
  { id: '294', codigo: 'INV-0294', nombre: 'Router Principal', ubicacion: 'Piso 3 - Pasillo B', estado: 'Dado de baja' },
  { id: '295', codigo: 'INV-0295', nombre: 'Lector de código de barras 16', ubicacion: 'Recursos Humanos', estado: 'En reparación' },
  { id: '296', codigo: 'INV-0296', nombre: 'PC Escritorio 17', ubicacion: 'Mantenimiento', estado: 'Operativo' },
  { id: '297', codigo: 'INV-0297', nombre: 'Laptop HP ProBook 18', ubicacion: 'Gerencia', estado: 'Dado de baja' },
  { id: '298', codigo: 'INV-0298', nombre: 'Servidor Dell PowerEdge', ubicacion: 'Cafetería', estado: 'En reparación' },
  { id: '299', codigo: 'INV-0299', nombre: 'Disco duro externo 20', ubicacion: 'Gerencia', estado: 'Dado de baja' },
  { id: '300', codigo: 'INV-0300', nombre: 'Proyector Epson 01', ubicacion: 'Cafetería', estado: 'Operativo' },
];


function localStorageDisponible() {
  try {
    return Platform.OS === 'web' && typeof window !== 'undefined' && !!window.localStorage;
  } catch (e) {
    return false;
  }
}

async function leerRaw(clave) {
  if (Platform.OS === 'web') {
    return localStorageDisponible() ? window.localStorage.getItem(clave) : null;
  }
  return AsyncStorage.getItem(clave);
}

async function escribirRaw(clave, valor) {
  if (Platform.OS === 'web') {
    if (!localStorageDisponible()) throw new Error('localStorage no disponible');
    window.localStorage.setItem(clave, valor);
    return;
  }
  await AsyncStorage.setItem(clave, valor);
}


function estimarDatosEquipo(nombre = '') {
  const n = nombre.toLowerCase();
  if (n.includes('servidor')) return { precio: 8500000, caracteristicas: 'Servidor empresarial; procesador, memoria RAM y discos dependen de la configuración exacta.' };
  if (n.includes('firewall')) return { precio: 3500000, caracteristicas: 'Firewall de seguridad de red; modelo, licencias y rendimiento no especificados.' };
  if (n.includes('laptop') || n.includes('portátil')) return { precio: 2800000, caracteristicas: 'Computador portátil; procesador, memoria RAM, almacenamiento y pantalla por confirmar.' };
  if (n.includes('pc todo en uno')) return { precio: 3000000, caracteristicas: 'Computador todo en uno; procesador, memoria RAM, almacenamiento y pantalla por confirmar.' };
  if (n.includes('pc escritorio')) return { precio: 2400000, caracteristicas: 'Computador de escritorio; procesador, memoria RAM, almacenamiento y monitor por confirmar.' };
  if (n.includes('monitor')) return { precio: n.includes('27') ? 850000 : 600000, caracteristicas: `Monitor ${n.includes('27') ? '27' : '24'} pulgadas; resolución y puertos por confirmar.` };
  if (n.includes('switch 24')) return { precio: 650000, caracteristicas: 'Switch de red de 24 puertos; velocidad, administración y PoE por confirmar.' };
  if (n.includes('switch 8')) return { precio: 250000, caracteristicas: 'Switch de red de 8 puertos; velocidad, administración y PoE por confirmar.' };
  if (n.includes('ups')) return { precio: 850000, caracteristicas: 'UPS de 1500 VA; autonomía, potencia en vatios y estado de batería por confirmar.' };
  if (n.includes('impresora multifuncional')) return { precio: 1100000, caracteristicas: 'Impresora multifuncional; tecnología, velocidad y conectividad por confirmar.' };
  if (n.includes('impresora de etiquetas')) return { precio: 1200000, caracteristicas: 'Impresora de etiquetas; resolución, ancho de impresión y conectividad por confirmar.' };
  if (n.includes('impresora')) return { precio: 900000, caracteristicas: 'Impresora láser; velocidad, dúplex y conectividad por confirmar.' };
  if (n.includes('escáner') || n.includes('escaner')) return { precio: 750000, caracteristicas: 'Escáner de documentos; resolución y velocidad por confirmar.' };
  if (n.includes('proyector')) return { precio: 2200000, caracteristicas: 'Proyector; resolución, brillo y conectividad por confirmar.' };
  if (n.includes('tablet')) return { precio: 1000000, caracteristicas: 'Tableta; tamaño de pantalla, memoria y conectividad por confirmar.' };
  if (n.includes('cámara')) return { precio: 450000, caracteristicas: 'Cámara IP; resolución, visión nocturna y alimentación por confirmar.' };
  if (n.includes('router')) return { precio: 500000, caracteristicas: 'Router de red; velocidad, puertos y capacidades inalámbricas por confirmar.' };
  if (n.includes('access point')) return { precio: 550000, caracteristicas: 'Punto de acceso Wi-Fi; estándar, bandas y velocidad por confirmar.' };
  if (n.includes('teléfono ip')) return { precio: 450000, caracteristicas: 'Teléfono IP; modelo, líneas y alimentación PoE por confirmar.' };
  if (n.includes('mouse')) return { precio: 70000, caracteristicas: 'Mouse inalámbrico; tipo de conexión y modelo por confirmar.' };
  if (n.includes('teclado')) return { precio: 100000, caracteristicas: 'Teclado; distribución, conexión y modelo por confirmar.' };
  if (n.includes('disco duro')) return { precio: 350000, caracteristicas: 'Disco duro externo; capacidad, interfaz y velocidad por confirmar.' };
  if (n.includes('código de barras')) return { precio: 450000, caracteristicas: 'Lector de código de barras; tipo de lectura y conexión por confirmar.' };
  if (n.includes('webcam')) return { precio: 250000, caracteristicas: 'Webcam; resolución, micrófono y conexión por confirmar.' };
  if (n.includes('parlante') || n.includes('micrófono')) return { precio: 500000, caracteristicas: 'Equipo de audio para conferencias; conexiones y cobertura por confirmar.' };
  return { precio: 0, caracteristicas: 'Especificaciones técnicas por confirmar.' };
}

function completarDatosEstimados(equipos, estimarPreciosFaltantes = false) {
  let actualizado = false;
  const lista = equipos.map((item) => {
    const faltaPrecio = item.precio == null && estimarPreciosFaltantes;
    const faltaDescripcion = !item.caracteristicas?.trim();
    if (!faltaPrecio && !faltaDescripcion) return item;

    const estimado = estimarDatosEquipo(item.nombre);
    actualizado = true;
    return {
      ...item,
      precio: item.precio ?? (estimarPreciosFaltantes ? estimado.precio : null),
      precioTipo: item.precio != null ? (item.precioTipo || 'registrado') : (estimarPreciosFaltantes ? 'estimado' : null),
      caracteristicas: item.caracteristicas?.trim() || estimado.caracteristicas,
    };
  });
  return { lista, actualizado };
}

async function cargarEquipos() {
  try {
    const version = await leerRaw(STORAGE_VERSION_KEY);
    const raw = await leerRaw(STORAGE_KEY);
    if (raw && version === DATA_VERSION) {
      const parseado = JSON.parse(raw);
      if (Array.isArray(parseado)) {
        const { lista, actualizado } = completarDatosEstimados(parseado);
        if (actualizado) await guardarEquipos(lista);
        return lista;
      }
    }
  } catch (error) {
    console.error('Error al leer datos guardados, se reinicia:', error);
  }

  const { lista: equiposIniciales } = completarDatosEstimados(EQUIPOS_INICIALES, true);
  try {
    await escribirRaw(STORAGE_KEY, JSON.stringify(equiposIniciales));
    await escribirRaw(STORAGE_VERSION_KEY, DATA_VERSION);
  } catch (error) {
    console.error('No se pudieron guardar los datos iniciales:', error);
  }
  return equiposIniciales;
}

async function guardarEquipos(lista) {
  await escribirRaw(STORAGE_KEY, JSON.stringify(lista));
  await escribirRaw(STORAGE_VERSION_KEY, DATA_VERSION);
}


function siguienteCodigo(lista) {
  const mayor = lista.reduce((max, item) => {
    const n = parseInt(String(item.codigo).replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `INV-${String(mayor + 1).padStart(4, '0')}`;
}


export function PantallaInventario() {
  return <PantallaAdaptativa />;
}


function PantallaAdaptativa() {
  const { width, height } = useWindowDimensions();
  const [equipos, setEquipos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [precio, setPrecio] = useState('');
  const [caracteristicas, setCaracteristicas] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('Todos');
  const [idEditando, setIdEditando] = useState(null);
  const [idPendienteEliminar, setIdPendienteEliminar] = useState(null);
  const [mostrarIA, setMostrarIA] = useState(false);

  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState(null);
  const nombreRef = useRef(null);
  const listaInventarioRef = useRef(null);
  const desplazamientoListaRef = useRef(0);
  const ubicacionRef = useRef(null);
  const precioRef = useRef(null);
  const timerAviso = useRef(null);

  const numColumns = width >= 1024 ? 3 : width >= 768 ? 2 : 1;

  const manejarRuedaInventario = (evento) => {
    if (Platform.OS !== 'web') return;
    const rueda = evento.nativeEvent || evento;
    if (!rueda.deltaY) return;
    evento.preventDefault?.();
    const factor = rueda.deltaMode === 1 ? 16 : rueda.deltaMode === 2 ? width : 1;
    const siguiente = Math.max(0, desplazamientoListaRef.current + rueda.deltaY * factor);
    desplazamientoListaRef.current = siguiente;
    listaInventarioRef.current?.scrollToOffset({ offset: siguiente, animated: false });
  };

  const mostrarAviso = (tipo, texto) => {
    clearTimeout(timerAviso.current);
    setAviso({ tipo, texto });
    timerAviso.current = setTimeout(() => setAviso(null), 4000);
  };

  useEffect(() => {
    let activo = true;
    cargarEquipos().then((lista) => {
      if (activo) setEquipos(lista);
    });
    return () => {
      activo = false;
      clearTimeout(timerAviso.current);
    };
  }, []);

  
  const guardarEnStorage = async (nuevaLista) => {
    try {
      await guardarEquipos(nuevaLista);
      setEquipos(nuevaLista);
      return true;
    } catch (error) {
      console.error('Error al guardar datos:', error);
      mostrarAviso('error', 'No se pudo guardar en el almacenamiento local.');
      return false;
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!nombre.trim()) nuevosErrores.nombre = 'Escribe el nombre del equipo.';
    if (!ubicacion.trim()) nuevosErrores.ubicacion = 'Escribe la ubicación del equipo.';
    if (precio.trim() && (!Number.isFinite(Number(precio.replace(',', '.'))) || Number(precio.replace(',', '.')) < 0)) {
      nuevosErrores.precio = 'Ingresa un precio válido igual o mayor que cero.';
    }
    setErrores(nuevosErrores);

    if (nuevosErrores.nombre) {
      nombreRef.current?.focus();
    } else if (nuevosErrores.ubicacion) {
      ubicacionRef.current?.focus();
    } else if (nuevosErrores.precio) {
      precioRef.current?.focus();
    }
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarOActualizarEquipo = async () => {
    if (!validarFormulario()) {
      mostrarAviso('error', 'Revisa los campos marcados en rojo.');
      return;
    }

    if (idEditando !== null) {
      const codigoEditado = equipoEnEdicion?.codigo || 'Equipo';
      const ubicacionActualizada = ubicacion.trim();
      const nuevaLista = equipos.map((item) => {
        if (String(item.id) === String(idEditando)) {
          return { ...item, nombre: nombre.trim(), ubicacion: ubicacion.trim(), precio: precio.trim() ? Number(precio.replace(',', '.')) : null, precioTipo: precio.trim() ? 'registrado' : null, caracteristicas: caracteristicas.trim() };
        }
        return item;
      });
      const ok = await guardarEnStorage(nuevaLista);
      if (!ok) return;
      setIdEditando(null);
      mostrarAviso('ok', `${codigoEditado} actualizado. Nueva ubicación: ${ubicacionActualizada}.`);
    } else {
      const nuevo = {
        id: String(Date.now()),
        codigo: siguienteCodigo(equipos),
        nombre: nombre.trim(),
        ubicacion: ubicacion.trim(),
        estado: 'Operativo',
        precio: precio.trim() ? Number(precio.replace(',', '.')) : null,
        precioTipo: precio.trim() ? 'registrado' : null,
        caracteristicas: caracteristicas.trim(),
      };
      const nuevaLista = [nuevo, ...equipos];
      const ok = await guardarEnStorage(nuevaLista);
      if (!ok) return;
      if (ok) mostrarAviso('ok', `Equipo ${nuevo.codigo} guardado.`);

      setTimeout(() => nombreRef.current?.focus(), 0);
    }

    setNombre('');
    setUbicacion('');
    setPrecio('');
    setCaracteristicas('');
    setErrores({});
  };

  const iniciarEdicion = (item) => {
    setNombre(item.nombre);
    setUbicacion(item.ubicacion);
    setPrecio(item.precio == null ? '' : String(item.precio));
    setCaracteristicas(item.caracteristicas || '');
    setIdEditando(item.id);
    setIdPendienteEliminar(null);
    setErrores({});
    setTimeout(() => {
      listaInventarioRef.current?.scrollToOffset({ offset: 0, animated: true });
      nombreRef.current?.focus();
    }, 0);
  };

  const cancelarEdicion = () => {
    setNombre('');
    setUbicacion('');
    setPrecio('');
    setCaracteristicas('');
    setIdEditando(null);
    setErrores({});
  };

  const solicitarEliminarEquipo = (idTarget) => {
    setIdPendienteEliminar(idTarget);
  };

  const cancelarEliminacion = () => {
    const equipoConservado = equipos.find((item) => String(item.id) === String(idPendienteEliminar));
    setIdPendienteEliminar(null);
    if (equipoConservado) mostrarAviso('ok', `${equipoConservado.codigo} se conservó en el inventario.`);
  };

  const confirmarEliminarEquipo = async (idTarget) => {
    const equipoEliminado = equipos.find((item) => String(item.id) === String(idTarget));
    const nuevaLista = equipos.filter((item) => String(item.id) !== String(idTarget));
    const ok = await guardarEnStorage(nuevaLista);
    setIdPendienteEliminar(null);
    if (String(idEditando) === String(idTarget)) {
      cancelarEdicion();
    }
    if (ok) mostrarAviso('ok', `Se eliminó ${equipoEliminado?.codigo || 'el equipo'} del inventario.`);
  };

  const equipoEnEdicion = equipos.find((item) => String(item.id) === String(idEditando));

  const terminoBusqueda = busqueda.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
  const equiposFiltrados = equipos.filter((item) => {
    const coincideEstado = filtro === 'Todos' || item.estado === filtro;
    const textoEquipo = `${item.codigo} ${item.nombre}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es');
    return coincideEstado && (!terminoBusqueda || textoEquipo.includes(terminoBusqueda));
  });

  const encabezado = (
    <View>
      <View style={styles.searchSection}>
        <Text style={styles.searchLabel}>Buscar en el inventario</Text>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            testID="buscar-inventario"
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Nombre o código (ej. INV-0049)"
            placeholderTextColor="#7B918D"
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Buscar equipo por nombre o código"
            style={styles.searchInput}
          />
          {busqueda.length > 0 && (
            <Pressable
              onPress={() => setBusqueda('')}
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
              hitSlop={8}
              style={styles.clearSearchButton}
            >
              <Text style={styles.clearSearchText}>×</Text>
            </Pressable>
          )}
        </View>
      </View>
      {/* FORMULARIO */}
      <View style={[styles.formCard, idEditando !== null && styles.formCardEditing]}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>
            {idEditando !== null ? 'Editar equipo' : 'Registrar nuevo equipo'}
          </Text>
          {idEditando !== null && (
            <Pressable
              onPress={cancelarEdicion}
              accessibilityRole="button"
              accessibilityLabel="Cancelar edición"
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          )}
        </View>

        {idEditando !== null && equipoEnEdicion ? (
          <View style={styles.editContext}>
            <Text style={styles.editContextLabel}>ESTÁS EDITANDO</Text>
            <Text style={styles.editContextName}>{equipoEnEdicion.nombre}</Text>
            <Text style={styles.editContextCode}>{equipoEnEdicion.codigo} · Los cambios se guardarán en este registro</Text>
          </View>
        ) : null}

        {aviso !== null && (
          <View
            style={[styles.aviso, aviso.tipo === 'ok' ? styles.avisoOk : styles.avisoError]}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Text style={[styles.avisoText, aviso.tipo === 'ok' ? styles.avisoTextOk : styles.avisoTextError]}>
              {aviso.texto}
            </Text>
          </View>
        )}

        <View style={styles.fieldLabelRow}>
          <Text style={styles.fieldLabel}>Nombre del equipo</Text>
          <Text style={styles.requiredLabel}>Obligatorio</Text>
        </View>
        <TextInput
          ref={nombreRef}
          style={[styles.input, errores.nombre && styles.inputError]}
          placeholder="Ej. Portátil HP ProBook"
          placeholderTextColor="#94A3B8"
          value={nombre}
          onChangeText={(texto) => {
            setNombre(texto);
            if (errores.nombre) setErrores((e) => ({ ...e, nombre: undefined }));
          }}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => ubicacionRef.current?.focus()}
          accessibilityLabel="Nombre del equipo, obligatorio"
          accessibilityHint={errores.nombre || 'Escribe el nombre del equipo.'}
        />
        {errores.nombre ? <Text style={styles.errorText} accessibilityRole="alert">{errores.nombre}</Text> : null}

        <View style={styles.fieldLabelRow}>
          <Text style={styles.fieldLabel}>Ubicación</Text>
          <Text style={styles.requiredLabel}>Obligatorio</Text>
        </View>
        <TextInput
          ref={ubicacionRef}
          style={[styles.input, errores.ubicacion && styles.inputError]}
          placeholder="Ej. Laboratorio de Sistemas"
          placeholderTextColor="#94A3B8"
          value={ubicacion}
          onChangeText={(texto) => {
            setUbicacion(texto);
            if (errores.ubicacion) setErrores((e) => ({ ...e, ubicacion: undefined }));
          }}
          returnKeyType="done"
          onSubmitEditing={guardarOActualizarEquipo}
          accessibilityLabel="Ubicación del equipo, obligatorio"
          accessibilityHint={errores.ubicacion || 'Escribe dónde se encuentra el equipo.'}
        />
        {errores.ubicacion ? <Text style={styles.errorText} accessibilityRole="alert">{errores.ubicacion}</Text> : null}

        <View style={styles.fieldLabelRow}>
          <Text style={styles.fieldLabel}>Precio</Text>
          <Text style={styles.optionalLabel}>Opcional · COP</Text>
        </View>
        <TextInput
          ref={precioRef}
          style={[styles.input, errores.precio && styles.inputError]}
          placeholder="Ej. 1250000"
          placeholderTextColor="#94A3B8"
          value={precio}
          onChangeText={(texto) => {
            setPrecio(texto.replace(/[^0-9.,]/g, ''));
            if (errores.precio) setErrores((e) => ({ ...e, precio: undefined }));
          }}
          keyboardType="decimal-pad"
          accessibilityLabel="Precio del equipo en pesos colombianos"
          accessibilityHint={errores.precio || 'Campo opcional. Ingresa un valor igual o mayor que cero.'}
        />
        {errores.precio ? <Text style={styles.errorText} accessibilityRole="alert">{errores.precio}</Text> : null}

        <View style={styles.fieldLabelRow}>
          <Text style={styles.fieldLabel}>Características</Text>
          <Text style={styles.optionalLabel}>Opcional</Text>
        </View>
        <TextInput
          style={[styles.input, styles.inputMultilinea]}
          placeholder="Marca, modelo, memoria, capacidad..."
          placeholderTextColor="#94A3B8"
          value={caracteristicas}
          onChangeText={setCaracteristicas}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          accessibilityLabel="Características del equipo, opcional"
        />

        <Pressable
          style={[styles.btnPrimary, idEditando !== null && styles.btnWarning]}
          onPress={guardarOActualizarEquipo}
          accessibilityRole="button"
          accessibilityLabel={idEditando !== null ? "Actualizar registro de equipo" : "Guardar equipo"}
        >
          <Text style={styles.btnPrimaryText}>
            {idEditando !== null ? 'Actualizar Registro' : 'Guardar'}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsContainer}
        keyboardShouldPersistTaps="handled"
      >
        {['Todos', 'Operativo', 'En reparación', 'Dado de baja'].map((cat) => (
          <Pressable
            key={cat}
            style={[styles.chip, filtro === cat && styles.chipSelected]}
            onPress={() => setFiltro(cat)}
            accessibilityRole="button"
          >
            <Text style={[styles.chipText, filtro === cat && styles.chipTextSelected]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
          key={numColumns}
          ref={listaInventarioRef}
          data={equiposFiltrados}
          style={[styles.listaInventario, Platform.OS === 'web' && styles.listaInventarioWeb]}
          nestedScrollEnabled
          scrollEventThrottle={16}
          scrollEnabled
          onWheel={manejarRuedaInventario}
          onScroll={(evento) => { desplazamientoListaRef.current = evento.nativeEvent.contentOffset.y; }}
          numColumns={numColumns}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.scrollContainer}
          columnWrapperStyle={numColumns > 1 ? styles.rowWrapper : undefined}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={encabezado}
          renderItem={({ item }) => {
          const colorEstado =
            item.estado === 'Operativo' ? '#059669' :
            item.estado === 'En reparación' ? '#D97706' : '#DC2626';

          const bgBadge =
            item.estado === 'Operativo' ? '#ECFDF5' :
            item.estado === 'En reparación' ? '#FFFBEB' : '#FEF2F2';
          const bordeEstado =
            item.estado === 'Operativo' ? '#10B981' :
            item.estado === 'En reparación' ? '#F59E0B' : '#EF4444';

          return (
            <View style={[styles.itemCard, { borderLeftColor: bordeEstado, width: numColumns === 3 ? '32.3%' : numColumns === 2 ? '48.5%' : '100%' }]}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemCode}>{item.codigo}</Text>
                <View style={[styles.badge, { backgroundColor: bgBadge }]}>
                  <Text style={[styles.badgeText, { color: colorEstado }]}>{item.estado}</Text>
                </View>
              </View>

              <Text style={styles.itemName}>{item.nombre}</Text>
              <View style={styles.itemLocationBox}>
                <Text style={styles.itemLocationIcon}>⌖</Text>
                <Text style={styles.itemLocation}>{item.ubicacion}</Text>
              </View>
              <View style={styles.itemInfoBox}>
                <Text style={styles.itemDetailLabel}>VALOR {item.precioTipo === 'estimado' ? 'ESTIMADO' : 'REGISTRADO'}</Text>
                <Text style={styles.itemPrice}>{item.precio == null || item.precio === '' ? 'Sin registrar' : '$' + Number(item.precio).toLocaleString('es-CO') + ' COP'}</Text>
                <Text style={styles.itemDetailLabel}>CARACTERÍSTICAS</Text>
                <Text style={styles.itemDetail}>{item.caracteristicas?.trim() || 'Por confirmar'}</Text>
              </View>

              <View style={styles.itemActions}>
                <Pressable
                  style={styles.btnEdit}
                  onPress={() => iniciarEdicion(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Editar ${item.codigo}`}
                  hitSlop={8}
                >
                  <Text style={styles.btnEditText}>Editar</Text>
                </Pressable>
                <Pressable
                  style={styles.btnDelete}
                  onPress={() => solicitarEliminarEquipo(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Eliminar ${item.codigo}`}
                  accessibilityHint="Solicita confirmación antes de eliminar el equipo"
                  hitSlop={8}
                >
                  <Text style={styles.btnDeleteText}>Eliminar</Text>
                </Pressable>
              </View>

              {String(idPendienteEliminar) === String(item.id) && (
                <View
                  style={styles.confirmacionEliminar}
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite"
                >
                  <Text style={styles.confirmacionTitulo}>¿Eliminar este equipo?</Text>
                  <Text style={styles.confirmacionTexto}>
                    {item.nombre} ({item.codigo}) se quitará del inventario. Esta acción no se puede deshacer.
                  </Text>
                  <View style={styles.confirmacionAcciones}>
                    <Pressable
                      style={styles.btnCancelarEliminar}
                      onPress={cancelarEliminacion}
                      accessibilityRole="button"
                      accessibilityLabel="Cancelar eliminación"
                    >
                      <Text style={styles.btnCancelarEliminarTexto}>Cancelar</Text>
                    </Pressable>
                    <Pressable
                      style={styles.btnConfirmarEliminar}
                      onPress={() => confirmarEliminarEquipo(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel="Confirmar eliminación"
                    >
                      <Text style={styles.btnConfirmarEliminarTexto}>Sí, eliminar equipo</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {busqueda.trim()
                  ? `No encontramos equipos para “${busqueda.trim()}”. Prueba con otro nombre o código.`
                  : filtro !== 'Todos'
                    ? `No hay equipos con estado “${filtro}”.`
                    : 'No hay registros de equipos disponibles.'}
              </Text>
            </View>
          }
        />

      {mostrarIA ? (
        <View
          style={[
            styles.chatPanel,
            {
              width: Math.min(420, width - 24),
              height: Math.min(680, height - 104),
            },
          ]}
        >
          <View style={styles.chatHeader}>
            <View style={styles.chatAvatar}><Text style={styles.chatAvatarText}>IA</Text></View>
            <View style={styles.chatHeaderCopy}>
              <Text style={styles.chatTitle}>Asistente de inventario</Text>
              <Text style={styles.chatSubtitle}>Consulta los equipos guardados</Text>
            </View>
            <Pressable
              testID="alternar-asistente-ia"
              accessibilityRole="button"
              accessibilityLabel="Cerrar asistente"
              style={styles.chatCloseButton}
              onPress={() => setMostrarIA(false)}
            >
              <Text style={styles.chatCloseText}>×</Text>
            </Pressable>
          </View>
          <AsistenteIA equipos={equipos} />
        </View>
      ) : (
        <Pressable
          testID="alternar-asistente-ia"
          accessibilityRole="button"
          accessibilityLabel="Abrir chat del asistente de inventario"
          accessibilityHint="Abre una ventana de chat sobre el inventario"
          style={({ pressed }) => [styles.chatFab, pressed && styles.chatFabPressed]}
          onPress={() => setMostrarIA(true)}
        >
          <Text style={styles.chatFabIcon}>💬</Text>
          <Text style={styles.chatFabLabel}>IA</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F7F6' },
  chatFab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F766E',
    borderWidth: 3,
    borderColor: '#D9F4EE',
    shadowColor: '#134E4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 7,
  },
  chatFabPressed: { transform: [{ scale: 0.95 }], opacity: 0.9 },
  chatFabIcon: { fontSize: 23, lineHeight: 27 },
  chatFabLabel: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', marginTop: -1 },
  chatPanel: {
    position: 'absolute',
    right: 12,
    bottom: 84,
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CDE5E0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#123B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#0F766E',
  },
  chatAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#D9F4EE', alignItems: 'center', justifyContent: 'center' },
  chatAvatarText: { color: '#0F766E', fontSize: 13, fontWeight: '900' },
  chatHeaderCopy: { flex: 1, gap: 2 },
  chatTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  chatSubtitle: { color: '#D5F1EB', fontSize: 11 },
  chatCloseButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF24' },
  chatCloseText: { color: '#FFFFFF', fontSize: 26, lineHeight: 30, fontWeight: '400' },
  scrollContainer: { padding: 12, paddingBottom: 30, maxWidth: 1400, alignSelf: 'center', width: '100%' },
  listaInventario: { flex: 1, minHeight: 0 },
  listaInventarioWeb: { overflowY: 'auto', overscrollBehaviorY: 'contain', touchAction: 'pan-y' },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formCardEditing: {
    borderColor: '#0F766E',
    borderWidth: 2,
    backgroundColor: '#F0FDFA',
  },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 },
  editContext: { padding: 12, marginBottom: 12, borderRadius: 10, borderWidth: 1, borderColor: '#99D7CC', backgroundColor: '#E4F7F2' },
  editContextLabel: { color: '#0F766E', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  editContextName: { color: '#164E45', fontSize: 15, lineHeight: 20, fontWeight: '800', marginTop: 3 },
  editContextCode: { color: '#35635C', fontSize: 11, lineHeight: 16, marginTop: 3 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, gap: 8 },
  fieldLabel: { color: '#263F3A', fontSize: 12, fontWeight: '700' },
  requiredLabel: { color: '#B5473D', fontSize: 10, fontWeight: '700' },
  optionalLabel: { color: '#718985', fontSize: 10, fontWeight: '600' },
  searchSection: { marginBottom: 12 },
  searchLabel: { color: '#35635C', fontSize: 12, fontWeight: '800', marginBottom: 6, marginLeft: 2 },
  searchBox: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#BFD9D4', borderRadius: 12 },
  searchIcon: { color: '#0F766E', fontSize: 24, lineHeight: 28, fontWeight: '700' },
  searchInput: { flex: 1, minWidth: 0, paddingVertical: 10, fontSize: 14, color: '#16332F' },
  clearSearchButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E7F2F0' },
  clearSearchText: { color: '#35635C', fontSize: 21, lineHeight: 24, fontWeight: '600' },
  formTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  cancelText: { fontSize: 12, fontWeight: '600', color: '#EF4444' },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#334155',
    marginBottom: 10,
  },
  inputError: { borderColor: '#DC2626', borderWidth: 1.5, marginBottom: 4 },
  inputMultilinea: { minHeight: 82, paddingTop: 10 },
  errorText: { color: '#DC2626', fontSize: 12, fontWeight: '600', marginBottom: 10 },
  aviso: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, borderWidth: 1 },
  avisoOk: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  avisoError: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  avisoText: { fontSize: 13, fontWeight: '600' },
  avisoTextOk: { color: '#047857' },
  avisoTextError: { color: '#B91C1C' },
  btnPrimary: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnWarning: { backgroundColor: '#2563EB' },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  chipsContainer: { maxHeight: 44, marginBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
    height: 36,
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: '#0F172A' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  chipTextSelected: { color: '#FFFFFF' },
  rowWrapper: { justifyContent: 'space-between' },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DCEAE7',
    borderLeftWidth: 4,
    shadowColor: '#164E45',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 2,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 },
  itemCode: { fontSize: 11, fontWeight: '800', color: '#0F766E', letterSpacing: 0.6 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  itemName: { fontSize: 17, lineHeight: 23, fontWeight: '800', color: '#16332F', marginBottom: 10 },
  itemLocationBox: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#F0F8F6', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 11 },
  itemLocationIcon: { color: '#0F766E', fontSize: 16, fontWeight: '800' },
  itemLocation: { flex: 1, fontSize: 12, color: '#35635C', fontWeight: '600' },
  itemInfoBox: { backgroundColor: '#F8FAF9', borderRadius: 10, padding: 11, marginBottom: 12, gap: 4 },
  itemDetailLabel: { fontSize: 9, color: '#718985', fontWeight: '800', letterSpacing: 0.8, marginTop: 3 },
  itemPrice: { fontSize: 14, color: '#164E45', fontWeight: '800', marginBottom: 3 },
  itemDetail: { fontSize: 12, color: '#526965', lineHeight: 18 },
  itemActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: '#E8F0EE', paddingTop: 10 },
  btnEdit: { backgroundColor: '#0F766E', paddingHorizontal: 16, minHeight: 44, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  btnEditText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  btnDelete: { backgroundColor: '#FFF5F4', paddingHorizontal: 14, minHeight: 44, borderRadius: 9, borderWidth: 1, borderColor: '#F5D1CE', alignItems: 'center', justifyContent: 'center' },
  btnDeleteText: { color: '#B5473D', fontSize: 12, fontWeight: '700' },
  confirmacionEliminar: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#EF9A91',
    backgroundColor: '#FFF4F2',
    borderRadius: 12,
    padding: 14,
  },
  confirmacionTitulo: { color: '#8E2D25', fontSize: 14, fontWeight: '800' },
  confirmacionTexto: { color: '#713A35', fontSize: 12, lineHeight: 18, marginTop: 5 },
  confirmacionAcciones: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  btnCancelarEliminar: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelarEliminarTexto: { color: '#334155', fontSize: 12, fontWeight: '700' },
  btnConfirmarEliminar: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#B91C1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnConfirmarEliminarTexto: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 30, width: '100%' },
  emptyText: { color: '#94A3B8', fontSize: 13 },
});
