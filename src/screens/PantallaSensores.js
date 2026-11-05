import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';

const INTERVALO_LECTURA_MS = 500;

export function PantallaSensores() {
  const esWeb = Platform.OS === 'web';

  const [disponible, setDisponible] = useState(esWeb ? false : null);
  const [error, setError] = useState(
    esWeb ? 'En web se usa el modo SIMULADO.' : null
  );
  const [modoSimulado, setModoSimulado] = useState(esWeb);

  const [datosReales, setDatosReales] = useState({ x: 0, y: 0, z: 0 });
  const [datosSimulados, setDatosSimulados] = useState({
    x: 0.05,
    y: 0,
    z: 0.98,
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      setDisponible(false);
      setModoSimulado(true);
      setError('En web se usa el modo SIMULADO.');
      return;
    }

    let activo = true;

    const comprobarSensor = async () => {
      try {
        const estaDisponible = await Accelerometer.isAvailableAsync();
        if (!activo) return;

        if (!estaDisponible) {
          setDisponible(false);
          setModoSimulado(true);
          setError('Acelerómetro no disponible. Se activó el modo SIMULADO.');
          return;
        }

        if (typeof Accelerometer.requestPermissionsAsync === 'function') {
          const { status } = await Accelerometer.requestPermissionsAsync();
          if (!activo) return;

          if (status !== 'granted') {
            setDisponible(false);
            setModoSimulado(true);
            setError('Permiso denegado. Se activó el modo SIMULADO.');
            return;
          }
        }

        setDisponible(true);
        setError(null);
      } catch {
        if (!activo) return;

        setDisponible(false);
        setModoSimulado(true);
        setError('No se pudo acceder al sensor. Se activó el modo SIMULADO.');
      }
    };

    comprobarSensor();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!disponible || modoSimulado || Platform.OS === 'web') return;

    try {
      Accelerometer.setUpdateInterval(INTERVALO_LECTURA_MS);
      const subscription = Accelerometer.addListener(setDatosReales);

      return () => {
        subscription?.remove();
      };
    } catch {
      setDisponible(false);
      setModoSimulado(true);
      setError('No se pudo iniciar el sensor. Se activó el modo SIMULADO.');
    }
  }, [disponible, modoSimulado]);

  const datosAMostrar = modoSimulado ? datosSimulados : datosReales;

  let interpretacionX = 'centro';

  if (datosAMostrar.x > 0.5) {
    interpretacionX = 'derecha';
  } else if (datosAMostrar.x < -0.5) {
    interpretacionX = 'izquierda';
  }

  const mensajeInterpretacion =
    interpretacionX === 'derecha'
      ? 'Inclinado hacia la DERECHA'
      : interpretacionX === 'izquierda'
        ? 'Inclinado hacia la IZQUIERDA'
        : 'Posición CENTRADA';

  const alineacionCirculo =
    interpretacionX === 'derecha'
      ? 'flex-end'
      : interpretacionX === 'izquierda'
        ? 'flex-start'
        : 'center';

  const colorContextual =
    interpretacionX === 'derecha'
      ? '#DC3545'
      : interpretacionX === 'izquierda'
        ? '#E67E22'
        : '#28A745';

  const simularIzquierda = () =>
    setDatosSimulados({ x: -0.85, y: 0.1, z: 0.2 });

  const simularCentro = () =>
    setDatosSimulados({ x: 0.05, y: 0, z: 0.98 });

  const simularDerecha = () =>
    setDatosSimulados({ x: 0.78, y: -0.1, z: 0.15 });

  if (disponible === null) {
    return (
      <View style={styles.contenedorSensores}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.textoAyudaSensor}>
          Comprobando disponibilidad del acelerómetro...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedorSensores}>
      <View
        style={[
          styles.badgeOrigen,
          { backgroundColor: modoSimulado ? '#FFF3CD' : '#D1E7DD' },
        ]}
      >
        <Text
          style={[
            styles.textoBadgeOrigen,
            { color: modoSimulado ? '#856404' : '#0F5132' },
          ]}
        >
          {modoSimulado
            ? 'ESTADO: SIMULADO'
            : 'ESTADO: SENSOR FÍSICO REAL'}
        </Text>
      </View>

      {error ? <Text style={styles.textoErrorSensor}>{error}</Text> : null}

      <View style={styles.tarjetaSensor}>
        <Text style={styles.filaSensor}>
          Eje X: {datosAMostrar.x.toFixed(2)}
        </Text>
        <Text style={styles.filaSensor}>
          Eje Y: {datosAMostrar.y.toFixed(2)}
        </Text>
        <Text style={styles.filaSensor}>
          Eje Z: {datosAMostrar.z.toFixed(2)}
        </Text>
      </View>

      <View style={styles.pistaIndicador}>
        <View
          style={[
            styles.contenedorCirculoIndicador,
            { justifyContent: alineacionCirculo },
          ]}
        >
          <View
            style={[
              styles.circuloIndicador,
              { backgroundColor: colorContextual },
            ]}
          />
        </View>
      </View>

      <Text
        style={[styles.mensajeInterpretacion, { color: colorContextual }]}
      >
        {mensajeInterpretacion}
      </Text>

      <View style={styles.grupoBotonesSimulador}>
        <Pressable
          style={[
            styles.botonSimular,
            modoSimulado &&
              datosSimulados.x < -0.5 &&
              styles.botonSimularActivo,
          ]}
          onPress={() => {
            setModoSimulado(true);
            simularIzquierda();
          }}
        >
          <Text
            style={[
              styles.textoBotonSimular,
              modoSimulado &&
                datosSimulados.x < -0.5 &&
                styles.textoBotonSimularActivo,
            ]}
          >
            Simular Izquierda
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.botonSimular,
            modoSimulado &&
              Math.abs(datosSimulados.x) <= 0.5 &&
              styles.botonSimularActivo,
          ]}
          onPress={() => {
            setModoSimulado(true);
            simularCentro();
          }}
        >
          <Text
            style={[
              styles.textoBotonSimular,
              modoSimulado &&
                Math.abs(datosSimulados.x) <= 0.5 &&
                styles.textoBotonSimularActivo,
            ]}
          >
            Centrar
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.botonSimular,
            modoSimulado &&
              datosSimulados.x > 0.5 &&
              styles.botonSimularActivo,
          ]}
          onPress={() => {
            setModoSimulado(true);
            simularDerecha();
          }}
        >
          <Text
            style={[
              styles.textoBotonSimular,
              modoSimulado &&
                datosSimulados.x > 0.5 &&
                styles.textoBotonSimularActivo,
            ]}
          >
            Simular Derecha
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.botonAlternarModo}
        onPress={() => {
          if (Platform.OS === 'web') {
            setModoSimulado(true);
            setError('En web se usa el modo SIMULADO.');
          } else {
            setModoSimulado((prev) => !prev);
          }
        }}
      >
        <Text style={styles.textoBotonAlternar}>
          {modoSimulado ? 'Modo Simulación Activo' : 'Activar Modo Simulación'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorSensores: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    width: '100%',
  },
  badgeOrigen: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  textoBadgeOrigen: {
    fontSize: 12,
    fontWeight: '800',
  },
  textoErrorSensor: {
    fontSize: 12,
    color: '#856404',
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 12,
  },
  tarjetaSensor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECEF',
    width: '100%',
    gap: 6,
  },
  filaSensor: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212529',
  },
  pistaIndicador: {
    width: '100%',
    marginTop: 20,
  },
  contenedorCirculoIndicador: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#EAECEF',
    padding: 6,
  },
  circuloIndicador: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  mensajeInterpretacion: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  grupoBotonesSimulador: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
    marginBottom: 16,
  },
  botonSimular: {
    flex: 1,
    backgroundColor: '#E9ECEF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonSimularActivo: {
    backgroundColor: '#0D6EFD',
  },
  textoBotonSimular: {
    fontSize: 11,
    fontWeight: '700',
    color: '#212529',
  },
  textoBotonSimularActivo: {
    color: '#FFFFFF',
  },
  botonAlternarModo: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#212529',
  },
  textoBotonAlternar: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  textoAyudaSensor: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 20,
  },
});