import { nanoid } from "nanoid";
import { v } from "convex/values";

import { internalMutation } from "./_generated/server";

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const creatorId = "j57bwhz8rf6s0x9p56qj8etjxh7ztp7v" as any;

    // ============= ARCADE 1: Blockchain Fundamentals =============
    const blockchainArcadeId = await ctx.db.insert("arcades", {
      title: "Blockchain Fundamentals",
      slug: "blockchain-fundamentals",
      description:
        "Domina los conceptos fundamentales de la tecnología blockchain a través de quizzes interactivos",
      image: "kg28ayyt9fnzdmgvsc3sj8yt9x8097g0" as any,
    });

    // ============= ARCADE 2: Ethereum 101 =============
    const ethereumArcadeId = await ctx.db.insert("arcades", {
      title: "Ethereum 101",
      slug: "ethereum-101",
      description:
        "Sumérgete en el mundo de Ethereum y el desarrollo de contratos inteligentes",
      image: "kg2eaaxy9btfnnm2sxjjafrd598088fx" as any,
    });

    // ============= BLOCKCHAIN QUIZZES (4 levels) =============
    const blockchainEasyQuizId = await ctx.db.insert("quizzes", {
      title: "Blockchain Fundamentals - Nivel Fácil",
      description: "Conceptos básicos de blockchain para principiantes",
      creatorId,
      scoringMode: { type: "lives", lives: 3 },
      shuffleQuestions: true,
    });

    const blockchainMediumQuizId = await ctx.db.insert("quizzes", {
      title: "Blockchain Fundamentals - Nivel Intermedio",
      description:
        "Profundiza en los mecanismos de consenso y estructuras de datos",
      creatorId,
      scoringMode: { type: "lives", lives: 3 },
      shuffleQuestions: true,
    });

    const blockchainHardQuizId = await ctx.db.insert("quizzes", {
      title: "Blockchain Fundamentals - Nivel Difícil",
      description: "Ataques, seguridad y conceptos avanzados de blockchain",
      creatorId,
      scoringMode: { type: "lives", lives: 3 },
      shuffleQuestions: true,
    });

    const blockchainInsaneQuizId = await ctx.db.insert("quizzes", {
      title: "Blockchain Fundamentals - Nivel Experto",
      description: "Domina los conceptos más avanzados de blockchain",
      creatorId,
      scoringMode: { type: "lives", lives: 3 },
      shuffleQuestions: true,
    });

    // ============= ETHEREUM QUIZZES (4 levels) =============
    const ethereumEasyQuizId = await ctx.db.insert("quizzes", {
      title: "Ethereum 101 - Nivel Fácil",
      description: "Introducción a Ethereum y sus conceptos básicos",
      creatorId,
      scoringMode: { type: "lives", lives: 3 },
      shuffleQuestions: true,
    });

    const ethereumMediumQuizId = await ctx.db.insert("quizzes", {
      title: "Ethereum 101 - Nivel Intermedio",
      description: "EVM, direcciones y transacciones en Ethereum",
      creatorId,
      scoringMode: { type: "lives", lives: 3 },
      shuffleQuestions: true,
    });

    const ethereumHardQuizId = await ctx.db.insert("quizzes", {
      title: "Ethereum 101 - Nivel Difícil",
      description: "EIPs, estándares de tokens y seguridad de contratos",
      creatorId,
      scoringMode: { type: "lives", lives: 3 },
      shuffleQuestions: true,
    });

    const ethereumInsaneQuizId = await ctx.db.insert("quizzes", {
      title: "Ethereum 101 - Nivel Experto",
      description: "MEV, abstracción de cuentas y conceptos avanzados",
      creatorId,
      scoringMode: { type: "lives", lives: 3 },
      shuffleQuestions: true,
    });

    // ============= BLOCKCHAIN ARCADE LEVELS =============
    await ctx.db.insert("arcadeLevels", {
      arcadeId: blockchainArcadeId,
      level: 1,
      quizId: blockchainEasyQuizId,
      labelDifficulty: "easy",
    });

    await ctx.db.insert("arcadeLevels", {
      arcadeId: blockchainArcadeId,
      level: 2,
      quizId: blockchainMediumQuizId,
      labelDifficulty: "medium",
    });

    await ctx.db.insert("arcadeLevels", {
      arcadeId: blockchainArcadeId,
      level: 3,
      quizId: blockchainHardQuizId,
      labelDifficulty: "hard",
    });

    await ctx.db.insert("arcadeLevels", {
      arcadeId: blockchainArcadeId,
      level: 4,
      quizId: blockchainInsaneQuizId,
      labelDifficulty: "insane",
    });

    // ============= ETHEREUM ARCADE LEVELS =============
    await ctx.db.insert("arcadeLevels", {
      arcadeId: ethereumArcadeId,
      level: 1,
      quizId: ethereumEasyQuizId,
      labelDifficulty: "easy",
    });

    await ctx.db.insert("arcadeLevels", {
      arcadeId: ethereumArcadeId,
      level: 2,
      quizId: ethereumMediumQuizId,
      labelDifficulty: "medium",
    });

    await ctx.db.insert("arcadeLevels", {
      arcadeId: ethereumArcadeId,
      level: 3,
      quizId: ethereumHardQuizId,
      labelDifficulty: "hard",
    });

    await ctx.db.insert("arcadeLevels", {
      arcadeId: ethereumArcadeId,
      level: 4,
      quizId: ethereumInsaneQuizId,
      labelDifficulty: "insane",
    });

    // ============= BLOCKCHAIN EASY QUESTIONS (5) =============
    const blockchainEasyQuestions = [
      {
        prompt: "¿Qué es una blockchain?",
        difficulty: "easy" as const,
        explanation:
          "Una blockchain es un libro de contabilidad distribuido e inmutable que registra transacciones a través de una red de computadoras.",
        order: 1,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Un tipo de criptomoneda" },
            { id: nanoid(), text: "Un lenguaje de programación" },
            { id: nanoid(), text: "Una tecnología de libro mayor distribuido" },
            { id: nanoid(), text: "Un sistema de gestión de bases de datos" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt: "¿Cómo se enlazan los bloques en una blockchain?",
        difficulty: "easy" as const,
        explanation:
          "Cada bloque contiene un hash criptográfico del bloque anterior, creando una cadena.",
        order: 2,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Hashes criptográficos" },
            { id: nanoid(), text: "Punteros" },
            { id: nanoid(), text: "URLs" },
            { id: nanoid(), text: "Direcciones IP" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt: "Bitcoin fue la primera blockchain.",
        difficulty: "easy" as const,
        explanation:
          "Bitcoin, creado por Satoshi Nakamoto en 2008, fue la primera implementación de la tecnología blockchain.",
        order: 3,
        typeConfig: {
          type: "true_or_false" as const,
          correctAnswer: true,
        },
      },
      {
        prompt:
          "¿Qué significa 'descentralizado' en el contexto de blockchain?",
        difficulty: "easy" as const,
        explanation:
          "Descentralizado significa que ninguna entidad controla la red; está distribuida entre muchos nodos.",
        order: 4,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Controlado por una empresa" },
            { id: nanoid(), text: "Ubicado en un solo centro de datos" },
            { id: nanoid(), text: "Gestionado por el gobierno" },
            { id: nanoid(), text: "Sin un único punto de control" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt:
          "Una blockchain puede ser modificada una vez que los datos son escritos en ella.",
        difficulty: "easy" as const,
        explanation:
          "La blockchain es inmutable - una vez que los datos son escritos, no pueden ser alterados sin el consenso de la red.",
        order: 5,
        typeConfig: {
          type: "true_or_false" as const,
          correctAnswer: false,
        },
      },
    ];

    // Set correct answers
    (blockchainEasyQuestions[0].typeConfig as any).correctAnswerId = (
      blockchainEasyQuestions[0].typeConfig as any
    ).options[2].id;
    (blockchainEasyQuestions[1].typeConfig as any).correctAnswerId = (
      blockchainEasyQuestions[1].typeConfig as any
    ).options[0].id;
    (blockchainEasyQuestions[3].typeConfig as any).correctAnswerId = (
      blockchainEasyQuestions[3].typeConfig as any
    ).options[3].id;

    for (const q of blockchainEasyQuestions) {
      await ctx.db.insert("quizQuestions", {
        quizId: blockchainEasyQuizId,
        ...q,
      });
    }

    // ============= BLOCKCHAIN MEDIUM QUESTIONS (5) =============
    const blockchainMediumQuestions = [
      {
        prompt: "¿Qué es un mecanismo de consenso?",
        difficulty: "intermediate" as const,
        explanation:
          "Un mecanismo de consenso es un protocolo que asegura que todos los nodos estén de acuerdo sobre el estado de la blockchain.",
        order: 1,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            {
              id: nanoid(),
              text: "Un sistema de votación para desarrolladores",
            },
            {
              id: nanoid(),
              text: "Un protocolo para que los nodos acuerden el estado de la blockchain",
            },
            { id: nanoid(), text: "Un tipo de encriptación" },
            { id: nanoid(), text: "Una plantilla de contrato inteligente" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt:
          "¿Cuáles de los siguientes son mecanismos de consenso válidos? (Selecciona todos los que apliquen)",
        difficulty: "intermediate" as const,
        explanation:
          "Proof of Work, Proof of Stake y Delegated Proof of Stake son mecanismos de consenso utilizados en blockchains.",
        order: 2,
        typeConfig: {
          type: "multiple_choice" as const,
          options: [
            { id: nanoid(), text: "Proof of Work (PoW)" },
            { id: nanoid(), text: "Proof of Stake (PoS)" },
            { id: nanoid(), text: "Proof of Location" },
            { id: nanoid(), text: "Delegated Proof of Stake (DPoS)" },
          ],
          correctAnswerIds: [] as string[],
        },
      },
      {
        prompt: "¿Qué es un 'nonce' en blockchain?",
        difficulty: "intermediate" as const,
        explanation:
          "Un nonce es un número usado una sola vez en la minería para encontrar un hash de bloque válido que cumpla con el objetivo de dificultad.",
        order: 3,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Un tipo de criptomoneda" },
            { id: nanoid(), text: "Una dirección de billetera" },
            { id: nanoid(), text: "Un número aleatorio usado en la minería" },
            { id: nanoid(), text: "Una tarifa de transacción" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt: "¿Para qué se usa un árbol de Merkle en blockchain?",
        difficulty: "intermediate" as const,
        explanation:
          "Los árboles de Merkle resumen eficientemente y verifican la integridad de grandes conjuntos de datos en un bloque.",
        order: 4,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            {
              id: nanoid(),
              text: "Verificar eficientemente la integridad de los datos",
            },
            { id: nanoid(), text: "Almacenar contraseñas de usuarios" },
            { id: nanoid(), text: "Minar nuevos bloques" },
            { id: nanoid(), text: "Crear direcciones de billetera" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt: "Una blockchain pública permite que cualquiera participe.",
        difficulty: "intermediate" as const,
        explanation:
          "Las blockchains públicas no requieren permisos, permitiendo a cualquiera unirse, leer y escribir en la red.",
        order: 5,
        typeConfig: {
          type: "true_or_false" as const,
          correctAnswer: true,
        },
      },
    ];

    (blockchainMediumQuestions[0].typeConfig as any).correctAnswerId = (
      blockchainMediumQuestions[0].typeConfig as any
    ).options[1].id;
    (blockchainMediumQuestions[1].typeConfig as any).correctAnswerIds = [
      (blockchainMediumQuestions[1].typeConfig as any).options[0].id,
      (blockchainMediumQuestions[1].typeConfig as any).options[1].id,
      (blockchainMediumQuestions[1].typeConfig as any).options[3].id,
    ];
    (blockchainMediumQuestions[2].typeConfig as any).correctAnswerId = (
      blockchainMediumQuestions[2].typeConfig as any
    ).options[2].id;
    (blockchainMediumQuestions[3].typeConfig as any).correctAnswerId = (
      blockchainMediumQuestions[3].typeConfig as any
    ).options[0].id;

    for (const q of blockchainMediumQuestions) {
      await ctx.db.insert("quizQuestions", {
        quizId: blockchainMediumQuizId,
        ...q,
      });
    }

    // ============= BLOCKCHAIN HARD QUESTIONS (5) =============
    const blockchainHardQuestions = [
      {
        prompt: "¿Qué es un ataque del 51%?",
        difficulty: "hard" as const,
        explanation:
          "Un ataque del 51% ocurre cuando una entidad controla más de la mitad del poder de minería de la red, permitiéndole manipular transacciones.",
        order: 1,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Cuando el 51% de los nodos se desconectan" },
            { id: nanoid(), text: "Cuando un bloque está 51% lleno" },
            {
              id: nanoid(),
              text: "Cuando un atacante controla la mayoría del poder de minería",
            },
            { id: nanoid(), text: "Cuando el 51% de los tokens son quemados" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt:
          "¿Cuáles propiedades son esenciales para una función hash criptográfica en blockchain? (Selecciona todas las que apliquen)",
        difficulty: "hard" as const,
        explanation:
          "Las funciones hash deben ser determinísticas, resistentes a colisiones y tener el efecto avalancha para la seguridad de blockchain.",
        order: 2,
        typeConfig: {
          type: "multiple_choice" as const,
          options: [
            { id: nanoid(), text: "Salida determinística" },
            { id: nanoid(), text: "Resistencia a colisiones" },
            { id: nanoid(), text: "Reversibilidad" },
            { id: nanoid(), text: "Efecto avalancha" },
          ],
          correctAnswerIds: [] as string[],
        },
      },
      {
        prompt: "¿Qué es el Problema de los Generales Bizantinos?",
        difficulty: "hard" as const,
        explanation:
          "El Problema de los Generales Bizantinos describe el desafío de alcanzar consenso en un sistema distribuido con actores potencialmente defectuosos o maliciosos.",
        order: 3,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            {
              id: nanoid(),
              text: "Un problema de consenso en sistemas distribuidos",
            },
            {
              id: nanoid(),
              text: "Un problema con velocidades de transacción lentas",
            },
            { id: nanoid(), text: "Un tipo de algoritmo de encriptación" },
            { id: nanoid(), text: "Un problema de dificultad de minería" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt: "¿Qué es la 'finalidad' en blockchain?",
        difficulty: "hard" as const,
        explanation:
          "La finalidad significa que una transacción es irreversible y está permanentemente registrada en la blockchain.",
        order: 4,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "El fin de una blockchain" },
            { id: nanoid(), text: "El último bloque en una cadena" },
            { id: nanoid(), text: "Cerrar una billetera" },
            {
              id: nanoid(),
              text: "Cuando una transacción se vuelve irreversible",
            },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt:
          "Proof of Stake es más eficiente energéticamente que Proof of Work.",
        difficulty: "hard" as const,
        explanation:
          "PoS no requiere cálculos intensivos de minería, haciéndolo significativamente más eficiente energéticamente que PoW.",
        order: 5,
        typeConfig: {
          type: "true_or_false" as const,
          correctAnswer: true,
        },
      },
    ];

    (blockchainHardQuestions[0].typeConfig as any).correctAnswerId = (
      blockchainHardQuestions[0].typeConfig as any
    ).options[2].id;
    (blockchainHardQuestions[1].typeConfig as any).correctAnswerIds = [
      (blockchainHardQuestions[1].typeConfig as any).options[0].id,
      (blockchainHardQuestions[1].typeConfig as any).options[1].id,
      (blockchainHardQuestions[1].typeConfig as any).options[3].id,
    ];
    (blockchainHardQuestions[2].typeConfig as any).correctAnswerId = (
      blockchainHardQuestions[2].typeConfig as any
    ).options[0].id;
    (blockchainHardQuestions[3].typeConfig as any).correctAnswerId = (
      blockchainHardQuestions[3].typeConfig as any
    ).options[3].id;

    for (const q of blockchainHardQuestions) {
      await ctx.db.insert("quizQuestions", {
        quizId: blockchainHardQuizId,
        ...q,
      });
    }

    // ============= BLOCKCHAIN INSANE QUESTIONS (5) =============
    const blockchainInsaneQuestions = [
      {
        prompt: "¿Qué es el problema de 'nothing at stake' en Proof of Stake?",
        difficulty: "insane" as const,
        explanation:
          "En PoS, los validadores pueden votar en múltiples bifurcaciones de cadena sin costo, potencialmente desestabilizando el consenso.",
        order: 1,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Los validadores no tienen tokens" },
            {
              id: nanoid(),
              text: "Los validadores pueden votar en múltiples bifurcaciones sin penalización",
            },
            { id: nanoid(), text: "La red no tiene valor" },
            { id: nanoid(), text: "Los bloques no contienen transacciones" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt:
          "¿A cuáles ataques son potencialmente vulnerables las blockchains? (Selecciona todos los que apliquen)",
        difficulty: "insane" as const,
        explanation:
          "Las blockchains pueden ser vulnerables a ataques Sybil, ataques de eclipse y estrategias de minería egoísta.",
        order: 2,
        typeConfig: {
          type: "multiple_choice" as const,
          options: [
            { id: nanoid(), text: "Ataque Sybil" },
            { id: nanoid(), text: "Ataque de eclipse" },
            { id: nanoid(), text: "Minería egoísta" },
            { id: nanoid(), text: "Inyección SQL" },
          ],
          correctAnswerIds: [] as string[],
        },
      },
      {
        prompt: "¿Qué es el 'sharding' en la escalabilidad de blockchain?",
        difficulty: "insane" as const,
        explanation:
          "El sharding divide la blockchain en particiones más pequeñas (shards) que procesan transacciones en paralelo.",
        order: 3,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Romper bloques en piezas más pequeñas" },
            { id: nanoid(), text: "Eliminar transacciones antiguas" },
            { id: nanoid(), text: "Comprimir datos de blockchain" },
            {
              id: nanoid(),
              text: "Particionar la red para procesamiento paralelo",
            },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt: "¿Qué es un 'ataque de largo alcance' en Proof of Stake?",
        difficulty: "insane" as const,
        explanation:
          "Un ataque de largo alcance implica que un atacante crea una cadena alternativa desde un punto lejano en el pasado usando claves de validador antiguas.",
        order: 4,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            {
              id: nanoid(),
              text: "Crear historial alternativo con claves antiguas",
            },
            { id: nanoid(), text: "Atacar nodos desde lejos" },
            {
              id: nanoid(),
              text: "Minar bloques lentamente a lo largo del tiempo",
            },
            { id: nanoid(), text: "Enviar transacciones a través de redes" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt:
          "Las pruebas de conocimiento cero pueden verificar información sin revelarla.",
        difficulty: "insane" as const,
        explanation:
          "Las pruebas ZK permiten a una parte demostrar conocimiento de un valor sin revelar el valor en sí.",
        order: 5,
        typeConfig: {
          type: "true_or_false" as const,
          correctAnswer: true,
        },
      },
    ];

    (blockchainInsaneQuestions[0].typeConfig as any).correctAnswerId = (
      blockchainInsaneQuestions[0].typeConfig as any
    ).options[1].id;
    (blockchainInsaneQuestions[1].typeConfig as any).correctAnswerIds = [
      (blockchainInsaneQuestions[1].typeConfig as any).options[0].id,
      (blockchainInsaneQuestions[1].typeConfig as any).options[1].id,
      (blockchainInsaneQuestions[1].typeConfig as any).options[2].id,
    ];
    (blockchainInsaneQuestions[2].typeConfig as any).correctAnswerId = (
      blockchainInsaneQuestions[2].typeConfig as any
    ).options[3].id;
    (blockchainInsaneQuestions[3].typeConfig as any).correctAnswerId = (
      blockchainInsaneQuestions[3].typeConfig as any
    ).options[0].id;

    for (const q of blockchainInsaneQuestions) {
      await ctx.db.insert("quizQuestions", {
        quizId: blockchainInsaneQuizId,
        ...q,
      });
    }

    // ============= ETHEREUM EASY QUESTIONS (5) =============
    const ethereumEasyQuestions = [
      {
        prompt: "¿Qué es Ethereum?",
        difficulty: "easy" as const,
        explanation:
          "Ethereum es una plataforma descentralizada que permite contratos inteligentes y aplicaciones descentralizadas.",
        order: 1,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Una plataforma de contratos inteligentes" },
            { id: nanoid(), text: "Un tipo de Bitcoin" },
            { id: nanoid(), text: "Una base de datos centralizada" },
            { id: nanoid(), text: "Un navegador web" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt: "¿Cuál es la criptomoneda nativa de Ethereum?",
        difficulty: "easy" as const,
        explanation:
          "Ether (ETH) es la criptomoneda nativa de la red Ethereum.",
        order: 2,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Bitcoin" },
            { id: nanoid(), text: "Solana" },
            { id: nanoid(), text: "Ether (ETH)" },
            { id: nanoid(), text: "Cardano" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt: "Ethereum soporta contratos inteligentes.",
        difficulty: "easy" as const,
        explanation:
          "Los contratos inteligentes son programas auto-ejecutables que corren en Ethereum y son una característica central de la plataforma.",
        order: 3,
        typeConfig: {
          type: "true_or_false" as const,
          correctAnswer: true,
        },
      },
      {
        prompt: "¿Quién creó Ethereum?",
        difficulty: "easy" as const,
        explanation:
          "Vitalik Buterin propuso Ethereum en 2013 y cofundó el proyecto.",
        order: 4,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Satoshi Nakamoto" },
            { id: nanoid(), text: "Charles Hoskinson" },
            { id: nanoid(), text: "Gavin Wood" },
            { id: nanoid(), text: "Vitalik Buterin" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt: "¿Qué es el 'gas' en Ethereum?",
        difficulty: "easy" as const,
        explanation:
          "El gas es la unidad que mide el esfuerzo computacional requerido para ejecutar operaciones en Ethereum.",
        order: 5,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Un tipo de token" },
            { id: nanoid(), text: "Una medida del esfuerzo computacional" },
            { id: nanoid(), text: "Un tipo de billetera" },
            { id: nanoid(), text: "Un mecanismo de consenso" },
          ],
          correctAnswerId: "",
        },
      },
    ];

    (ethereumEasyQuestions[0].typeConfig as any).correctAnswerId = (
      ethereumEasyQuestions[0].typeConfig as any
    ).options[0].id;
    (ethereumEasyQuestions[1].typeConfig as any).correctAnswerId = (
      ethereumEasyQuestions[1].typeConfig as any
    ).options[2].id;
    (ethereumEasyQuestions[3].typeConfig as any).correctAnswerId = (
      ethereumEasyQuestions[3].typeConfig as any
    ).options[3].id;
    (ethereumEasyQuestions[4].typeConfig as any).correctAnswerId = (
      ethereumEasyQuestions[4].typeConfig as any
    ).options[1].id;

    for (const q of ethereumEasyQuestions) {
      await ctx.db.insert("quizQuestions", {
        quizId: ethereumEasyQuizId,
        ...q,
      });
    }

    // ============= ETHEREUM MEDIUM QUESTIONS (5) =============
    const ethereumMediumQuestions = [
      {
        prompt: "¿Qué es la EVM?",
        difficulty: "intermediate" as const,
        explanation:
          "La Máquina Virtual de Ethereum (EVM) es el entorno de ejecución para ejecutar contratos inteligentes en Ethereum.",
        order: 1,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Administrador de Video Ethereum" },
            { id: nanoid(), text: "Memoria de Bóveda Encriptada" },
            { id: nanoid(), text: "Máquina Virtual de Ethereum" },
            { id: nanoid(), text: "Módulo de Verificación Externa" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt:
          "¿Cuáles lenguajes pueden usarse para escribir contratos inteligentes de Ethereum? (Selecciona todos los que apliquen)",
        difficulty: "intermediate" as const,
        explanation:
          "Solidity y Vyper son los principales lenguajes para escribir contratos inteligentes de Ethereum.",
        order: 2,
        typeConfig: {
          type: "multiple_choice" as const,
          options: [
            { id: nanoid(), text: "Solidity" },
            { id: nanoid(), text: "Vyper" },
            { id: nanoid(), text: "Python" },
            { id: nanoid(), text: "JavaScript" },
          ],
          correctAnswerIds: [] as string[],
        },
      },
      {
        prompt: "¿Qué es una dirección de Ethereum?",
        difficulty: "intermediate" as const,
        explanation:
          "Una dirección de Ethereum es una cadena hexadecimal de 42 caracteres derivada de la clave pública.",
        order: 3,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Un correo electrónico para Ethereum" },
            { id: nanoid(), text: "Un nombre de dominio" },
            {
              id: nanoid(),
              text: "Un identificador hexadecimal de 42 caracteres",
            },
            { id: nanoid(), text: "Un formato de número telefónico" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt:
          "¿Cuál es el propósito del 'nonce' en las transacciones de Ethereum?",
        difficulty: "intermediate" as const,
        explanation:
          "El nonce es un contador que asegura que las transacciones se procesen en orden y previene ataques de repetición.",
        order: 4,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            {
              id: nanoid(),
              text: "Ordenar transacciones y prevenir repetición",
            },
            { id: nanoid(), text: "Agregar aleatoriedad" },
            { id: nanoid(), text: "Encriptar datos" },
            { id: nanoid(), text: "Identificar al remitente" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt:
          "Ethereum hizo la transición de Proof of Work a Proof of Stake.",
        difficulty: "intermediate" as const,
        explanation:
          "The Merge en septiembre de 2022 hizo la transición de Ethereum de PoW a consenso PoS.",
        order: 5,
        typeConfig: {
          type: "true_or_false" as const,
          correctAnswer: true,
        },
      },
    ];

    (ethereumMediumQuestions[0].typeConfig as any).correctAnswerId = (
      ethereumMediumQuestions[0].typeConfig as any
    ).options[2].id;
    (ethereumMediumQuestions[1].typeConfig as any).correctAnswerIds = [
      (ethereumMediumQuestions[1].typeConfig as any).options[0].id,
      (ethereumMediumQuestions[1].typeConfig as any).options[1].id,
    ];
    (ethereumMediumQuestions[2].typeConfig as any).correctAnswerId = (
      ethereumMediumQuestions[2].typeConfig as any
    ).options[2].id;
    (ethereumMediumQuestions[3].typeConfig as any).correctAnswerId = (
      ethereumMediumQuestions[3].typeConfig as any
    ).options[0].id;

    for (const q of ethereumMediumQuestions) {
      await ctx.db.insert("quizQuestions", {
        quizId: ethereumMediumQuizId,
        ...q,
      });
    }

    // ============= ETHEREUM HARD QUESTIONS (5) =============
    const ethereumHardQuestions = [
      {
        prompt: "¿Qué es EIP-1559?",
        difficulty: "hard" as const,
        explanation:
          "EIP-1559 introdujo un mecanismo de quema de tarifa base y cambió el mercado de tarifas de Ethereum.",
        order: 1,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Un nuevo estándar de tokens" },
            { id: nanoid(), text: "Una actualización de consenso" },
            { id: nanoid(), text: "Una especificación de billetera" },
            {
              id: nanoid(),
              text: "Una reforma del mercado de tarifas con quema de tarifa base",
            },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt:
          "¿Cuáles son estándares de tokens de Ethereum válidos? (Selecciona todos los que apliquen)",
        difficulty: "hard" as const,
        explanation:
          "ERC-20, ERC-721 y ERC-1155 son todos estándares de tokens en Ethereum para diferentes casos de uso.",
        order: 2,
        typeConfig: {
          type: "multiple_choice" as const,
          options: [
            { id: nanoid(), text: "ERC-20" },
            { id: nanoid(), text: "ERC-721" },
            { id: nanoid(), text: "ERC-1155" },
            { id: nanoid(), text: "ERC-999" },
          ],
          correctAnswerIds: [] as string[],
        },
      },
      {
        prompt: "¿Qué es un 'ataque de reentrada'?",
        difficulty: "hard" as const,
        explanation:
          "Un ataque de reentrada explota un contrato llamándolo recursivamente antes de que las actualizaciones de estado se completen.",
        order: 3,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Entrar a un contrato múltiples veces" },
            {
              id: nanoid(),
              text: "Explotar llamadas recursivas antes de actualizaciones de estado",
            },
            { id: nanoid(), text: "Re-entrar a una red blockchain" },
            { id: nanoid(), text: "Enviar transacciones repetidamente" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt: "¿Cuál es la diferencia entre 'call' y 'delegatecall'?",
        difficulty: "hard" as const,
        explanation:
          "delegatecall ejecuta código en el contexto del contrato que llama, usando su almacenamiento.",
        order: 4,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "No hay diferencia" },
            {
              id: nanoid(),
              text: "delegatecall usa el contexto de almacenamiento del llamador",
            },
            { id: nanoid(), text: "call es más rápido" },
            { id: nanoid(), text: "delegatecall envía más gas" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt:
          "Los slots de almacenamiento en contratos inteligentes de Ethereum comienzan en el índice 0.",
        difficulty: "hard" as const,
        explanation:
          "Las variables de estado se asignan a slots de almacenamiento comenzando desde el slot 0, en el orden en que se declaran.",
        order: 5,
        typeConfig: {
          type: "true_or_false" as const,
          correctAnswer: true,
        },
      },
    ];

    (ethereumHardQuestions[0].typeConfig as any).correctAnswerId = (
      ethereumHardQuestions[0].typeConfig as any
    ).options[3].id;
    (ethereumHardQuestions[1].typeConfig as any).correctAnswerIds = [
      (ethereumHardQuestions[1].typeConfig as any).options[0].id,
      (ethereumHardQuestions[1].typeConfig as any).options[1].id,
      (ethereumHardQuestions[1].typeConfig as any).options[2].id,
    ];
    (ethereumHardQuestions[2].typeConfig as any).correctAnswerId = (
      ethereumHardQuestions[2].typeConfig as any
    ).options[1].id;
    (ethereumHardQuestions[3].typeConfig as any).correctAnswerId = (
      ethereumHardQuestions[3].typeConfig as any
    ).options[1].id;

    for (const q of ethereumHardQuestions) {
      await ctx.db.insert("quizQuestions", {
        quizId: ethereumHardQuizId,
        ...q,
      });
    }

    // ============= ETHEREUM INSANE QUESTIONS (5) =============
    const ethereumInsaneQuestions = [
      {
        prompt: "¿Qué es 'MEV' (Valor Máximo Extraíble)?",
        difficulty: "insane" as const,
        explanation:
          "MEV es el valor máximo que puede extraerse reordenando, insertando o censurando transacciones en un bloque.",
        order: 1,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Validación Máxima de Ethereum" },
            { id: nanoid(), text: "Valor de eficiencia de minería" },
            {
              id: nanoid(),
              text: "Valor de la manipulación del orden de transacciones",
            },
            { id: nanoid(), text: "Verificación de ejecución de memoria" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt:
          "¿Cuáles son estrategias comunes de MEV? (Selecciona todas las que apliquen)",
        difficulty: "insane" as const,
        explanation:
          "Ataques sandwich, frontrunning y backrunning son estrategias comunes de extracción de MEV.",
        order: 2,
        typeConfig: {
          type: "multiple_choice" as const,
          options: [
            { id: nanoid(), text: "Ataques sandwich" },
            { id: nanoid(), text: "Frontrunning" },
            { id: nanoid(), text: "Backrunning" },
            { id: nanoid(), text: "Inyección SQL" },
          ],
          correctAnswerIds: [] as string[],
        },
      },
      {
        prompt: "¿Qué es la 'abstracción de cuentas' (ERC-4337)?",
        difficulty: "insane" as const,
        explanation:
          "La abstracción de cuentas permite que billeteras de contratos inteligentes inicien transacciones, habilitando características como recuperación social y patrocinio de gas.",
        order: 3,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            {
              id: nanoid(),
              text: "Habilitar billeteras de contratos inteligentes como cuentas de primera clase",
            },
            { id: nanoid(), text: "Ocultar saldos de cuentas" },
            { id: nanoid(), text: "Abstraer detalles de blockchain" },
            { id: nanoid(), text: "Eliminar requisitos de cuenta" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt: "¿Qué es 'proto-danksharding' (EIP-4844)?",
        difficulty: "insane" as const,
        explanation:
          "Proto-danksharding introduce transacciones blob para reducir costos de Layer 2 como un paso hacia el danksharding completo.",
        order: 4,
        typeConfig: {
          type: "single_choice" as const,
          options: [
            { id: nanoid(), text: "Un nuevo mecanismo de consenso" },
            { id: nanoid(), text: "Transacciones blob para escalabilidad L2" },
            { id: nanoid(), text: "Una implementación de sharding" },
            { id: nanoid(), text: "Un protocolo de privacidad" },
          ],
          correctAnswerId: "",
        },
      },
      {
        prompt:
          "El bytecode de la EVM se ejecuta en una máquina virtual basada en pila.",
        difficulty: "insane" as const,
        explanation:
          "La EVM es una máquina basada en pila que procesa instrucciones de bytecode usando una pila LIFO.",
        order: 5,
        typeConfig: {
          type: "true_or_false" as const,
          correctAnswer: true,
        },
      },
    ];

    (ethereumInsaneQuestions[0].typeConfig as any).correctAnswerId = (
      ethereumInsaneQuestions[0].typeConfig as any
    ).options[2].id;
    (ethereumInsaneQuestions[1].typeConfig as any).correctAnswerIds = [
      (ethereumInsaneQuestions[1].typeConfig as any).options[0].id,
      (ethereumInsaneQuestions[1].typeConfig as any).options[1].id,
      (ethereumInsaneQuestions[1].typeConfig as any).options[2].id,
    ];
    (ethereumInsaneQuestions[2].typeConfig as any).correctAnswerId = (
      ethereumInsaneQuestions[2].typeConfig as any
    ).options[0].id;
    (ethereumInsaneQuestions[3].typeConfig as any).correctAnswerId = (
      ethereumInsaneQuestions[3].typeConfig as any
    ).options[1].id;

    for (const q of ethereumInsaneQuestions) {
      await ctx.db.insert("quizQuestions", {
        quizId: ethereumInsaneQuizId,
        ...q,
      });
    }

    console.log("¡Seed completado exitosamente!");
    console.log(
      "Se crearon 2 arcades, 8 quizzes (4 por arcade), 8 arcade levels y 40 preguntas.",
    );
  },
});

export const seedFutureWorkshops = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const creatorId = "j57bwhz8rf6s0x9p56qj8etjxh7ztp7v" as any;
    const communityId = "jd708znqvk4r7wytp01k82562h7zw1fe" as any;

    const workshops = [
      {
        title: "OpenClaw Agents en Base: del hype al MVP funcional",
        description:
          "Taller práctico para lanzar agentes onchain con OpenClaw sobre Base y automatizar acciones reales.",
        startDate: Date.UTC(2026, 2, 13, 18, 0, 0, 0),
        endDate: Date.UTC(2026, 2, 13, 20, 0, 0, 0),
        tags: ["Base", "OpenClaw", "Agentes", "Onchain"],
      },
      {
        title: "Despliega tu primera Mini App en Farcaster/Base App",
        description:
          "Construye y publica una Mini App lista para usuarios reales en el ecosistema social de Farcaster + Base App.",
        startDate: Date.UTC(2026, 2, 13, 21, 0, 0, 0),
        endDate: Date.UTC(2026, 2, 13, 23, 0, 0, 0),
        tags: ["Farcaster", "Base App", "Mini Apps", "SocialFi"],
      },
      {
        title: "Account Abstraction 2026: paymasters y smart wallets",
        description:
          "Implementa UX sin fricción con smart wallets, sesiones y gas patrocinado para onboarding masivo.",
        startDate: Date.UTC(2026, 2, 16, 19, 0, 0, 0),
        endDate: Date.UTC(2026, 2, 16, 21, 0, 0, 0),
        tags: ["Account Abstraction", "ERC-4337", "Smart Wallets"],
      },
      {
        title: "Restaking y AVS: diseña productos sobre la nueva capa de seguridad",
        description:
          "Explora casos de uso de restaking y AVS para crear productos web3 con seguridad compartida.",
        startDate: Date.UTC(2026, 2, 20, 19, 30, 0, 0),
        endDate: Date.UTC(2026, 2, 20, 21, 30, 0, 0),
        tags: ["Restaking", "AVS", "Infraestructura", "Ethereum"],
      },
    ] as const;

    for (const workshop of workshops) {
      await ctx.db.insert("workshops", {
        title: workshop.title,
        description: workshop.description,
        startDate: workshop.startDate,
        endDate: workshop.endDate,
        creatorId,
        communityId,
        location: {
          type: "online",
          link: "https://buildea.com/live",
        },
        publicationState: { type: "published" },
        coHosts: [],
        tags: [...workshop.tags],
        registrationCount: 0,
        recentRegistrations: [],
      });
    }

    return null;
  },
});
