import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Platform, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';


const esWebInsegura =
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  window.isSecureContext === false;

export function PantallaCamara() {
  const [permission, requestPermission] = useCameraPermissions();
  const [camaraLista, setCamaraLista] = useState(false);
  const [errorCamara, setErrorCamara] = useState(null);

  if (esWebInsegura) {
    return (
      <View style={styles.contenedorCentro}>
        <Text style={styles.textoError}>La cámara está bloqueada en esta conexión</Text>
        <Text style={styles.textoMensaje}>
          Estás abriendo la app por una dirección http que no es segura. El navegador solo permite la cámara en https o en localhost.
          Abre la app mediante una dirección https (por ejemplo con un túnel como ngrok o cloudflared) y vuelve a probar.
        </Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.contenedorCentro}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.textoMensaje}>Cargando estado de permisos...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    const puedePedir = permission.canAskAgain !== false;
    return (
      <View style={styles.contenedorCentro}>
        <Text style={styles.textoMensaje}>
          {puedePedir
            ? 'Se requiere permiso para mostrar la vista previa de la cámara.'
            : 'El permiso de cámara fue denegado. Actívalo manualmente en los ajustes del navegador o del teléfono.'}
        </Text>
        {puedePedir ? (
          <Button onPress={requestPermission} title="Conceder Permiso" />
        ) : (
          Platform.OS !== 'web' && (
            <Button onPress={() => Linking.openSettings()} title="Abrir ajustes" />
          )
        )}
      </View>
    );
  }

  return (
    <View style={styles.contenedorCamara}>
      <Text style={styles.subtituloCamara}>Vista Previa de Cámara </Text>
      <View style={styles.marcoCamara}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onCameraReady={() => {
            setCamaraLista(true);
            setErrorCamara(null);
          }}
          onMountError={(e) => setErrorCamara(e?.message || 'No se pudo iniciar la cámara.')}
        />

        {!camaraLista && !errorCamara && (
          <View style={styles.capaEstado}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.textoEstado}>Iniciando cámara...</Text>
          </View>
        )}

        {errorCamara && (
          <View style={styles.capaEstado}>
            <Text style={styles.textoEstado}>Error de cámara: {errorCamara}</Text>
          </View>
        )}

        {camaraLista && (
          <View style={styles.overlayCamara}>
            <Text style={styles.textoOverlay}>Cámara activa (no requiere tomar fotos)</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorCentro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  textoMensaje: { fontSize: 13, textAlign: 'center', marginBottom: 12, color: '#495057' },
  textoError: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 8, color: '#B91C1C' },
  contenedorCamara: { flex: 1, width: '100%', alignItems: 'center' },
  subtituloCamara: { fontSize: 14, fontWeight: '700', marginBottom: 10, color: '#212529' },
  marcoCamara: { width: '100%', height: 380, borderRadius: 16, overflow: 'hidden', position: 'relative', backgroundColor: '#334155' },
  capaEstado: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', padding: 16 },
  textoEstado: { color: '#FFFFFF', fontSize: 13, textAlign: 'center', marginTop: 8 },
  overlayCamara: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', paddingVertical: 12, alignItems: 'center' },
  textoOverlay: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});