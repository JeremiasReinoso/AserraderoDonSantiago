/* Datos comerciales confirmados en el sitio. Las medidas de placas que no figuran aquí se solicitan al usuario para no inventarlas. */
window.ASERRADERO_CONFIG = {
  whatsapp: "5492944928970",
  location: "Ruta Nacional, El Hoyo, Chubut, Argentina",
  coverage: "Patagonia, Argentina",
  responseTime: "24 Horas",
  products: [
    {
      id: "osb",
      name: "OSB",
      category: "Paneles estructurales",
      type: "OSB",
      use: "Estructura, muros, techos y pisos",
      availability: "Disponible",
      description: "Panel estructural de alta resistencia para construcción drywall, techos, pisos y entramados.",
      image: "img/Paneles/Imagen Panel 1.jpeg",
      detailUrl: "Servicios/Osb.html",
      features: [
        "Panel estructural de alta carga",
        "Aplicación en muros, techos, pisos y cerramientos",
        "Estabilidad dimensional y rápido montaje",
        "Medidas estándar: 1.22 × 2.44 m y 1.22 × 1.83 m"
      ],
      calculator: "board",
      boardSizes: [
        { label: "1.22 × 2.44 m (2.97 m²)", width: 1.22, length: 2.44 },
        { label: "1.22 × 1.83 m (2.23 m²)", width: 1.22, length: 1.83 }
      ]
    },
    {
      id: "maderas",
      name: "Maderas",
      category: "Madera aserrada",
      type: "Madera",
      use: "Obra, estructura y terminación",
      availability: "Disponible",
      description: "Variedad de especies seleccionadas y cortes a medida para obra, estructura, techos y carpintería.",
      image: "img/Estructura de madera/Estructura de madera 1.jpg",
      detailUrl: "Servicios/Madera.html",
      features: [
        "Maderas seleccionadas y secadas",
        "Corte a medida listo para instalar",
        "Para estructuras, tirantería, techos y terminaciones",
        "Asesoramiento técnico según exigencia del proyecto"
      ],
      calculator: "wood"
    },
    {
      id: "fenolicos",
      name: "Fenólicos",
      category: "Tableros técnicos",
      type: "Fenólico",
      use: "Encofrado y obra",
      availability: "Disponible",
      description: "Tableros prensados resistentes a la humedad, ideales para encofrados, moldajes y aplicaciones de alta exigencia.",
      image: "img/Fenolicos/Imagen Fenolico 1.jpg",
      detailUrl: "Servicios/Fenolico.html",
      features: [
        "Fabricado con capas de madera prensadas",
        "Alta resistencia a la humedad y menor deformación",
        "Superficie lisa, uniforme y reutilizable varias veces",
        "Para encofrados de hormigón, obra general y estructuras"
      ],
      calculator: "board",
      boardSizes: []
    },
    {
      id: "clavos",
      name: "Clavos",
      category: "Fijaciones",
      type: "Clavos",
      use: "Fijación de obra y carpintería",
      availability: "Disponible",
      description: "Anillados, espiralados, galvanizados, puntas y especiales en diversas medidas con stock listo para entregar.",
      image: "img/Obra/Imagen Obra 8.jpeg",
      detailUrl: "Servicios/Clavos.html",
      features: [
        "Cabeza plana 2 pulgadas y 3 pulgadas (caja o kilo)",
        "Espiralado para maderas duras y alto esfuerzo (caja o kilo)",
        "Galvanizado para techo resistente a la humedad (caja o kilo)",
        "Para pallets (bolsa o kilo) y Punta sin cabeza (caja)"
      ],
      variants: [
        { name: "Cabeza plana 2 pulgadas", detail: "Uso general en obra, maderas blandas y estructuras livianas", presentation: "Caja o kilo" },
        { name: "Cabeza plana 3 pulgadas", detail: "Mayor agarre para tirantería y carpintería pesada", presentation: "Caja o kilo" },
        { name: "Espiralado", detail: "Mejor sujeción en maderas duras y estructuras de alto esfuerzo", presentation: "Caja o kilo" },
        { name: "Galvanizado para techo", detail: "Protección extra contra humedad para cubiertas y exterior", presentation: "Caja o kilo" },
        { name: "Para pallets", detail: "Resistentes para armado de embalajes, pallets y cajones", presentation: "Bolsa o kilo" },
        { name: "Punta sin cabeza", detail: "Terminaciones limpias para muebles y trabajos finos", presentation: "Caja" }
      ]
    },
    {
      id: "aglomerado",
      name: "Aglomerado",
      category: "Tableros interiores",
      type: "Aglomerado",
      use: "Muebles y revestimientos",
      availability: "Disponible",
      description: "Tableros melamínicos y en crudo con superficie pareja y estabilidad uniforme para muebles y terminaciones.",
      image: "img/Aglomerados/Madera Aglomerada 1.jpg",
      detailUrl: "Servicios/Aglomerado.html",
      features: [
        "Melamínicos y en crudo para interiores",
        "Superficie pareja y prolija de fácil corte y armado",
        "Versátil para muebles, placares y revestimientos",
        "Excelente rendimiento y relación costo-beneficio"
      ],
      calculator: "board",
      boardSizes: []
    },
    {
      id: "paneles-solares",
      name: "Paneles solares",
      category: "Energía sustentable",
      type: "Solar",
      use: "Ahorro energético y autonomía",
      availability: "Disponible",
      description: "Sistemas de energía solar para viviendas, comercios, proyectos rurales y obras nuevas en la Patagonia.",
      image: "img/Obra/Imagen Obra 10.jpeg",
      detailUrl: "Sistemas constructivos/Panelessolares.html",
      features: [
        "Captación solar, conversión por inversor y respaldo eléctrico",
        "Para viviendas, comercios, zonas rurales y obras nuevas",
        "Opciones conectadas a red o con baterías (LiFePO4, NMC, AGM, Gel)",
        "Calculadora de paneles, baterías y consumo por electrodoméstico"
      ],
      calculator: "solar",
      batteryOptions: [
        { label: "LiFePO4 10kWh ~$2,500 ARS (15 años vida útil)", value: "2500|10|15" },
        { label: "NMC 10kWh ~$1,800 ARS (12 años vida útil)", value: "1800|10|12" },
        { label: "AGM 2kWh ~$400 ARS (6 años vida útil)", value: "400|2|6" },
        { label: "Gel 2kWh ~$300 ARS (5 años vida útil)", value: "300|2|5" }
      ]
    }
  ]
};
