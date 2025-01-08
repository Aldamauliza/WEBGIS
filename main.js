var mapView = new ol.View({
  center: ol.proj.fromLonLat([97.13651497096069, 5.182266955834211]),
  zoom: 16,
});

var map = new ol.Map({
  target: "map",
  view: mapView,
});

var osmFile = new ol.layer.Tile({
  title: "Open Street Map",
  visible: true,
  source: new ol.source.OSM(),
});

map.addLayer(osmFile);

var googleSatLayer = new ol.layer.Tile({
  title: "Google Satellite",
  visible: true,
  source: new ol.source.XYZ({
    url: "https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    maxZoom: 20,
    tilePixelRatio: 1,
    tileSize: 256,
    projection: "EPSG:3857",
  }),
});

map.addLayer(googleSatLayer);

var createLayer = function (title, layerName) {
  return new ol.layer.Tile({
    title: title,
    source: new ol.source.TileWMS({
      url: "http://localhost:8080/geoserver/gisKutaBlang/wms",
        params: { LAYERS: "gisKutaBlang:" + layerName, TILED: true },
        serverType: "geoserver",
        visible: true,
    }),
  });
};

var polygonGroup = new ol.layer.Group({
  title: "Polygon",
  layers: [
    createLayer("Rumah", "rumah"),
    createLayer("Ruko", "ruko"),
    createLayer("Kios", "kios"),
    createLayer("Bank", "bank"),
    createLayer("Pasar", "pasar"),
    createLayer("Kantor", "kantor"),
    createLayer("Puskesmas", "puskesmas"),
    createLayer("Rumah Sakit", "rumah_sakit"),
    createLayer("Sekolah", "sekolah"),
    createLayer("SPBU", "spbu"),
    createLayer("Museum", "museum"),
    createLayer("Lapangan", "lapangan"),
    createLayer("Kuburan", "kuburan"),
    createLayer("Taman", "taman"),
    createLayer("Mesjid", "mesjid"),
    createLayer("Cafe", "cafe"),
  ],
});


map.addLayer(polygonGroup);

// Inisialisasi Layer Polyline
// Inisialisasi Layer Polyline SINI
var polylineGroup = new ol.layer.Group({
  title: "Polyline",
  layers: [
    createLayer("Batas Gampong", "batas_gampong_real"),
    createLayer("Jalan", "jalan_gampong"),
    createLayer("Jurong", "jurong_gampong"),
    createLayer("Got", "parit_gampong"),
  ],
});


map.addLayer(polylineGroup);

// Inisialisasi Layer Point SINI
var pointGroup = new ol.layer.Group({
  title: "Point",
  layers: [
    createLayer("Rumah", "point_rumah"),
    createLayer("Ruko", "p_ruko"),
    createLayer("Kios", "p_kios"),
    createLayer("Bank", "p_bank"),
    createLayer("Pasar", "p_pasar"),
    createLayer("Kantor", "p_kantor"),
    createLayer("Puskesmas", "p_puskesmas"),
    createLayer("Rumah Sakit", "p_rs"),
    createLayer("Sekolah", "sekolah_point"),
    createLayer("SPBU", "p_spbu"),
    createLayer("Museum", "p_museum"),
    createLayer("Lapangan", "p_lapangan"),
    createLayer("Kuburan", "kuburan_point"),
    createLayer("Taman", "p_taman"),
    createLayer("Mesjid", "mesjid_point"),
    createLayer("Cafe", "p_cafe"),
  ],
});

map.addLayer(pointGroup);

var layerSwitcher = new ol.control.LayerSwitcher({
  activationMode: "click",
  startActive: false,
  groupSelectStyle: "children",
});

map.addControl(layerSwitcher);

var container = document.getElementById("popup");
var content = document.getElementById("popup-content");
var closer = document.getElementById("popup-closer");

var popup = new ol.Overlay({
  element: container,
  autoPan: true,
  autoAnimation: {
    duration: 250,
  },
});

map.addOverlay(popup);

closer.onclick = function () {
  popup.setPosition(undefined);
  closer.blur();
  return false;
};

function handlePopupLayer(
  layerName,
  featureInfoProperties,
  extraProperties = {}
) {
  map.on("singleclick", function (evt) {
    content.innerHTML = "";
    var resolution = mapView.getResolution();
    var url = createLayer(layerName, layerName.toLowerCase())
      .getSource()
      .getFeatureInfoUrl(evt.coordinate, resolution, "EPSG:3857", {
        INFO_FORMAT: "application/json",
        propertyName: featureInfoProperties,
      });

    if (url) {
      console.log(url);
      $.getJSON(url, function (data) {
        var feature = data.features[0];
        var props = feature.properties;
        var popupContent = Object.entries(extraProperties)
          .map(
            ([key, label]) => `<h3> ${label} : </h3> <p>${props[key]}</p> <br>`
          )
          .join(" ");
        content.innerHTML = popupContent;
        popup.setPosition(evt.coordinate);
      });
    } else {
      popup.setPosition(undefined);
    }
  });
}

handlePopupLayer(
  "rumah",
  "no_rumah,status_kep,nama_kk,jml_laki2,perempuan,ttl_hunian,no_telp",
  {
    no_rumah: "No Rumah",
    status_kep: "Status Kepemilikan",
    nama_kk: "Nama Pemilik",
    jml_laki2: "Penghuni Laki-laki",
    perempuan: "Penghuni Perempuan",
    ttl_hunian: "Total Penghuni",
    no_telp: "Nomor Telepon",
  }
);

handlePopupLayer("ruko", "pemilik,j_usaha,contact", {
  pemilik: "Nama Pemilik",
  j_usaha: "Jenis Toko",
  contact: "Kontak",
});

handlePopupLayer("kios", "pemilik,j_usaha,kontak", {
  pemilik: "Nama Pemilik",
  j_usaha: "Jenis Toko",
  kontak: "Kontak",
});

handlePopupLayer("sekolah", "nama", {
  nama: "Nama Instansi Pendidikan",
});

handlePopupLayer("cafe", "nama_cafe", {
  nama_cafe: "Nama Cafe",
});

handlePopupLayer("kantor", "nama", {
  nama: "Nama Kantor",
});

handlePopupLayer("mesjid", "nama", {
  nama: "Nama Mesjid",
});

handlePopupLayer("rumah_sakit", "nama", {
  nama: "Nama Rumah Sakit",
});

handlePopupLayer("lapangan", "lapangan, jenis", {
  lapangan: "Lapangan",
  jenis: "Jenis Olahraga",
});

handlePopupLayer("spbu", "nama_spbu", {
  nama_spbu: "Nama SPBU",
});

handlePopupLayer("taman", "namataman", {
  namataman: "Nama Taman",
});

handlePopupLayer("pasar", "namapasar", {
  namapasar: "Nama Pasar",
});

handlePopupLayer("kuburan", "pemilik", {
  pemilik: "Nama Pemilik",
});

handlePopupLayer("musueum", "nama", {
  nama: "Nama Museum",
});

handlePopupLayer("puskesmas", "n_kepala", {
  n_kepala: "Nama Kepala",
});

handlePopupLayer("jurong_gampong", ["nama", "panjang", "lebar", "jenis"], {
  nama: "Nama Jurong",
  panjang: "Panjang",
  lebar: "Lebar",
  jenis: "Jenis",
});

handlePopupLayer("parit_gampong", ["panjang", "lebar"], {
  panjang: "Panjang",
  lebar: "Lebar",
});

handlePopupLayer("jalan_gampong", ["nama_jalan", "panjang", "lebar"], {
  nama_jalan: "Nama jalan",
  panjang: "Panjang jalan",
  lebar: "Lebar jalan",
});