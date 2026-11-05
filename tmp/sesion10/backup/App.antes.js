import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { PantallaInventario } from './src/screens/PantallaInventario';
import { PantallaSensores } from './src/screens/PantallaSensores';
import { PantallaCamara } from './src/screens/PantallaCamara';

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

function MainApp() {
  const [pestanaActiva, setPestanaActiva] = useState('Inventario');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={styles.contenido}>
        <Text style={styles.titulo}>
          {pestanaActiva === 'Inventario'
            ? 'Inventario de Equipos'
            : pestanaActiva === 'Sensores'
            ? 'Sensores y Acelerómetro'
            : 'Exploración de Cámara'}
        </Text>

        {/* NAVEGACIÓN POR PESTAÑAS */}
        <View style={styles.pestanas}>
          <Pressable
            style={[styles.botonPestana, pestanaActiva === 'Inventario' && styles.botonPestanaActivo]}
            onPress={() => setPestanaActiva('Inventario')}
          >
            <Text style={[styles.textoPestana, pestanaActiva === 'Inventario' && styles.textoPestanaActivo]}>
              Inventario
            </Text>
          </Pressable>

          <Pressable
            style={[styles.botonPestana, pestanaActiva === 'Sensores' && styles.botonPestanaActivo]}
            onPress={() => setPestanaActiva('Sensores')}
          >
            <Text style={[styles.textoPestana, pestanaActiva === 'Sensores' && styles.textoPestanaActivo]}>
              Sensores
            </Text>
          </Pressable>

          <Pressable
            style={[styles.botonPestana, pestanaActiva === 'Camara' && styles.botonPestanaActivo]}
            onPress={() => setPestanaActiva('Camara')}
          >
            <Text style={[styles.textoPestana, pestanaActiva === 'Camara' && styles.textoPestanaActivo]}>
              Cámara
            </Text>
          </Pressable>
        </View>

        {/* CONTENEDOR FLEXIBLE PARA LAS PANTALLAS */}
        <View style={styles.pantallaContenedor}>
          {pestanaActiva === 'Inventario' ? (
            <PantallaInventario />
          ) : pestanaActiva === 'Sensores' ? (
            <PantallaSensores />
          ) : (
            <PantallaCamara />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  contenido: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  titulo: { fontSize: 22, fontWeight: '800', color: '#212529' },
  pestanas: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 16 },
  botonPestana: { flex: 1, paddingVertical: 10, backgroundColor: '#E9ECEF', borderRadius: 12, alignItems: 'center' },
  botonPestanaActivo: { backgroundColor: '#212529' },
  textoPestana: { fontSize: 13, fontWeight: '600', color: '#495057' },
  textoPestanaActivo: { color: '#FFFFFF' },
  pantallaContenedor: { flex: 1 }, // Garantiza que cada pantalla expanda todo el alto sobrante
});