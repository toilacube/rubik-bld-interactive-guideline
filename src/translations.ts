export type Language = 'en' | 'vi'

export const translations = {
  en: {
    brandMark: 'Old Pochmann',
    conceptsLabel: 'Concepts',
    conceptsTitle: 'Old Pochmann model',
    conceptsSummary: 'Think in sticker cycles. Every letter is a setup, a swap, and an undo.',
    guidedLabel: 'Guided example',
    guidedTitle: 'One complete example solve',
    guidedSummary: 'Follow a single scramble from memo to execution, one slow step at a time.',
    trainerLabel: 'Scramble trainer',
    trainerTitle: 'Memo and execution flow',
    trainerSummary: 'Enter a scramble, inspect memo pairs, parity, and the execution list.',
    methodConstants: 'Method constants',
    edgeBuffer: 'Edge buffer',
    edgeTarget: 'Edge target',
    cornerBuffer: 'Corner buffer',
    cornerTarget: 'Corner target',
    eyebrow: 'For CFOP cubers learning blind',
    swapAlgs: 'Swap algs',
    activeExecution: 'Active execution',
    visibleAlgorithm: 'Visible algorithm',
    selectTargetLetter: 'Select a target letter',
    conceptStack: 'Concept stack',
    conceptsList: [
      {
        title: 'Memo stickers, not cubies.',
        desc: 'The sticker in the buffer tells you where to shoot next.'
      },
      {
        title: 'Execution is mechanical.',
        desc: 'For each letter, setup the target sticker, run the swap algorithm, undo setup.'
      },
      {
        title: 'New cycles are explicit.',
        desc: 'When the buffer returns while other pieces remain unsolved, break into any unsolved sticker and continue.'
      },
      {
        title: 'Orientation cases become memo pairs.',
        desc: 'Flipped edges and twisted corners show up as two letters on the same physical piece.'
      },
      {
        title: 'Parity is predictable.',
        desc: 'Odd edge memo and odd corner memo means run the parity alg between the two phases.'
      }
    ],
    edgeSwap: 'Edge swap',
    cornerSwap: 'Corner swap',
    parity: 'Parity',
    oddAndOdd: 'Odd and odd',
    urToUl: 'UR to UL',
    lubToDfr: 'LUB to DFR',
    edgeLetterScheme: 'Edge letter scheme',
    cornerLetterScheme: 'Corner letter scheme',
    letterTableHead: {
      letter: 'Letter',
      sticker: 'Sticker',
      setup: 'Setup',
      undo: 'Undo'
    },
    none: 'none',
    slowLearnerRoadmap: 'Slow learner roadmap',
    readinessChecklist: 'Readiness checklist',
    practiceSchedule: 'Practice schedule',
    roadmap: [
      {
        title: '1. Learn what a sticker target means',
        detail: 'A target is not just a cubie. It is the exact sticker currently sitting in your buffer. If the edge buffer sticker shows Q, you execute the Q target, even if the cubie name feels different.'
      },
      {
        title: '2. Memorize edges and corners separately',
        detail: 'Write edge letters first, then corner letters. Pair them two letters at a time only after the raw sequence is correct. Do not try to invent images while you are still unsure about the letters.'
      },
      {
        title: '3. Execute one letter at a time',
        detail: 'For every letter say: setup, swap, undo. Pause after the undo and confirm that you are ready for the next letter. Speed does not matter while learning.'
      },
      {
        title: '4. Add cycle breaks slowly',
        detail: 'When the buffer comes home but pieces are still unsolved, pick an unsolved sticker, add that letter, and continue until that same physical piece returns.'
      },
      {
        title: '5. Add parity only after edges',
        detail: 'If the edge memo count is odd and the corner memo count is odd, run the parity algorithm after edges and before corners. Do not run parity at the end.'
      }
    ],
    beginnerChecks: [
      'I can point to the edge buffer UR and the corner buffer LUB on the net.',
      'I can explain why UL is edge letter D and DFR is corner letter V.',
      'I can execute the edge swap and corner swap from muscle memory while looking.',
      'I can do one setup, swap, undo, then reverse back to a solved cube.',
      'I can identify when a memo has odd edge and odd corner counts.'
    ],
    slowPracticePlan: [
      'Day 1: learn the letter net only. No blindfold. Touch each sticker and say its letter.',
      'Day 2: drill direct targets D for edges and V for corners until setupless swaps feel normal.',
      'Day 3: drill five setup targets. Say the setup aloud, execute the swap, undo immediately.',
      'Day 4: trace short scrambles on paper. Stop after memo; do not execute yet.',
      'Day 5: do sighted BLD solves. Read memo from the page and execute one letter at a time.',
      'Day 6+: try blindfolded only when sighted BLD solves are boring and repeatable.'
    ],
    workedExampleScramble: 'Worked example scramble',
    guidedIntro: 'This page is not a random trainer. It is one complete sighted BLD solve. Read each section in order, click the current execution letter, and watch only that step on the cube above.',
    step1EdgeMemo: 'Step 1: write edge memo',
    edgeMemoDesc: 'Start from the edge buffer `UR`. The letter sequence below is paired only to make it easier to read.',
    edgeMemoTip1: 'Say the first pair slowly.',
    edgeMemoTip2: 'Point to each target letter on the letter scheme table if needed.',
    edgeMemoTip3: 'Do not execute yet. This step is only memo.',
    step2CornerMemo: 'Step 2: write corner memo',
    cornerMemoDesc: 'After edges, move to the corner buffer `LUB`. Treat corners as a separate list.',
    cornerMemoTip1: 'Read corners after edges, not mixed with edges.',
    cornerMemoTip2: 'Every corner letter still means setup, swap, undo.',
    cornerMemoTip3: 'Keep the corner memo separate until execution.',
    step3CheckParity: 'Step 3: check parity',
    runParityAfterEdges: 'Run parity after edges',
    noParityInExample: 'No parity in this example',
    parityDesc: 'Count the raw edge letters and raw corner letters. If both counts are odd, parity is inserted after all edges and before the first corner.',
    step4ExecuteEdges: 'Step 4: execute edges first',
    executeEdgesDesc: 'Click edge step 1. Do its setup, swap, and undo. Then move to the next edge letter. Do not start corners until every edge row is done.',
    edgeLettersCount: 'edge letters',
    step5ExecuteCorners: 'Step 5: execute corners last',
    executeCornersDesc: 'Corners use the corner swap and their own setup table. If there is parity, do parity before this section.',
    cornerLettersCount: 'corner letters',
    numberedExecutionWalkthrough: 'Numbered execution walkthrough',
    howToUsePage: 'How to use this page',
    howToUseTips: [
      'First read the memo cards without touching the cube.',
      'Then click execution row 1 and perform only that row.',
      'After the undo, pause and click the next row.',
      'If the cube above looks confusing, ignore animation and read the row chips.',
      'Repeat this exact example until the order feels boring.'
    ],
    scrambleTitle: 'Scramble',
    exampleScrambleSelect: 'Example scramble',
    scrambleInputLabel: 'Scramble input',
    invalidScramble: 'Invalid scramble',
    edgesCard: 'Edges',
    cornersCard: 'Corners',
    solved: 'Solved',
    lettersUnit: 'letters',
    runParity: 'Run parity',
    noParity: 'No parity',
    parityConditionMuted: 'Edge and corner counts are not both odd.',
    executionList: 'Execution list',
    slowSolveProtocol: 'Slow solve protocol',
    protocolMemoTitle: 'Memo pass',
    protocolMemoDesc: 'Read the edge memo from left to right. Mark every cycle break mentally as a fresh start, not as a mistake. Then repeat the same process for corners.',
    protocolExecTitle: 'Execution pass',
    protocolExecDesc: 'Click the first execution row, do only that algorithm, then move to the next row. Do not look ahead while your hands are moving.',
    protocolErrorTitle: 'Error recovery',
    protocolErrorDesc: 'If you lose your place, stop immediately. Find the last completed letter in the execution list instead of guessing the next algorithm.',
    letterSchemeCube: 'Letter scheme cube',
    letterSchemeCubeDesc: 'Centers stay as face names. Edge and corner stickers show their memo letters for the default white-top, green-front orientation.',
    bufferStickersHighlighted: 'Buffer stickers highlighted',
    selectedStickerLabel: 'Selected sticker',
    setupMovesLabel: 'Setup moves',
    undoMovesLabel: 'Undo moves',
    bufferLabel: 'Buffer (no setup required)',
    clickToViewSetup: 'Click any letter to view setup & undo moves'
  },
  vi: {
    brandMark: 'Old Pochmann',
    conceptsLabel: 'Khái niệm',
    conceptsTitle: 'Mô hình Old Pochmann',
    conceptsSummary: 'Tư duy theo các chu kỳ nhãn nhám (sticker). Mỗi chữ cái là một bước thiết lập (setup), hoán vị (swap), và đảo ngược (undo).',
    guidedLabel: 'Ví dụ hướng dẫn',
    guidedTitle: 'Một ví dụ giải hoàn chỉnh',
    guidedSummary: 'Theo dõi một lượt xáo duy nhất từ ghi nhớ (memo) đến thực thi (execution), từng bước chậm rãi.',
    trainerLabel: 'Luyện tập xáo',
    trainerTitle: 'Luồng ghi nhớ và thực thi',
    trainerSummary: 'Nhập một lượt xáo, kiểm tra các cặp ghi nhớ, parity, và danh sách thực thi.',
    methodConstants: 'Hằng số phương pháp',
    edgeBuffer: 'Bộ đệm cạnh (Edge buffer)',
    edgeTarget: 'Mục tiêu cạnh',
    cornerBuffer: 'Bộ đệm góc (Corner buffer)',
    cornerTarget: 'Mục tiêu góc',
    eyebrow: 'Dành cho cuber CFOP học chơi bịt mắt (3BLD)',
    swapAlgs: 'Công thức hoán vị',
    activeExecution: 'Thực thi hiện tại',
    visibleAlgorithm: 'Công thức hiển thị',
    selectTargetLetter: 'Chọn một chữ cái mục tiêu',
    conceptStack: 'Ngăn xếp khái niệm',
    conceptsList: [
      {
        title: 'Ghi nhớ nhãn nhám (sticker), không phải viên (cubie).',
        desc: 'Nhãn nhám trong bộ đệm cho biết nơi tiếp theo cần bắn tới.'
      },
      {
        title: 'Thực thi mang tính cơ học.',
        desc: 'Với mỗi chữ cái, thiết lập (setup) nhãn mục tiêu, chạy công thức hoán vị, và đảo ngược thiết lập (undo).'
      },
      {
        title: 'Các chu kỳ mới được xác định rõ ràng.',
        desc: 'Khi bộ đệm trở về vị trí cũ nhưng các viên khác vẫn chưa giải, hãy phá chu kỳ vào bất kỳ nhãn chưa giải nào và tiếp tục.'
      },
      {
        title: 'Các trường hợp định hướng trở thành cặp ghi nhớ.',
        desc: 'Các cạnh bị lật và góc bị xoắn hiển thị dưới dạng hai chữ cái trên cùng một viên vật lý.'
      },
      {
        title: 'Parity có thể dự đoán được.',
        desc: 'Số lượng ghi nhớ cạnh lẻ và góc lẻ nghĩa là chạy công thức parity giữa hai giai đoạn.'
      }
    ],
    edgeSwap: 'Hoán vị cạnh',
    cornerSwap: 'Hoán vị góc',
    parity: 'Parity',
    oddAndOdd: 'Lẻ và lẻ',
    urToUl: 'UR sang UL',
    lubToDfr: 'LUB sang DFR',
    edgeLetterScheme: 'Sơ đồ chữ cái cạnh',
    cornerLetterScheme: 'Sơ đồ chữ cái góc',
    letterTableHead: {
      letter: 'Chữ cái',
      sticker: 'Nhãn nhám',
      setup: 'Thiết lập',
      undo: 'Đảo ngược'
    },
    none: 'không có',
    slowLearnerRoadmap: 'Lộ trình cho người học chậm',
    readinessChecklist: 'Danh sách kiểm tra độ sẵn sàng',
    practiceSchedule: 'Lịch trình luyện tập',
    roadmap: [
      {
        title: '1. Hiểu ý nghĩa của mục tiêu nhãn nhám (sticker target)',
        detail: 'Một mục tiêu không chỉ là một viên. Đó là nhãn nhám chính xác hiện đang nằm trong bộ đệm của bạn. Nếu nhãn nhám bộ đệm cạnh hiển thị Q, bạn thực hiện mục tiêu Q, ngay cả khi tên của viên đó có vẻ khác.'
      },
      {
        title: '2. Ghi nhớ cạnh và góc riêng biệt',
        detail: 'Viết các chữ cái cạnh trước, sau đó là chữ cái góc. Ghép đôi chúng hai chữ cái một lần chỉ sau khi chuỗi thô đã chính xác. Đừng cố tạo ra hình ảnh liên tưởng khi bạn vẫn chưa chắc chắn về các chữ cái.'
      },
      {
        title: '3. Thực thi từng chữ cái một',
        detail: 'Đối với mỗi chữ cái hãy tự nhủ: thiết lập, hoán vị, đảo ngược. Tạm dừng sau khi đảo ngược để xác nhận bạn đã sẵn sàng cho chữ cái tiếp theo. Tốc độ không quan trọng khi đang học.'
      },
      {
        title: '4. Thêm điểm ngắt chu kỳ từ từ',
        detail: 'Khi bộ đệm trở về đúng vị trí nhưng các viên khác vẫn chưa được giải, chọn một nhãn chưa giải, thêm chữ cái đó và tiếp tục cho đến khi viên vật lý đó quay trở lại.'
      },
      {
        title: '5. Chỉ thêm parity sau khi giải xong cạnh',
        detail: 'Nếu số lượng ghi nhớ cạnh là lẻ và góc cũng lẻ, hãy chạy công thức parity sau khi hoàn thành cạnh và trước khi bắt đầu góc. Đừng chạy parity ở cuối cùng.'
      }
    ],
    beginnerChecks: [
      'Tôi có thể chỉ ra bộ đệm cạnh UR và bộ đệm góc LUB trên sơ đồ phẳng.',
      'Tôi có thể giải thích tại sao UL là chữ cái cạnh D và DFR là chữ cái góc V.',
      'Tôi có thể thực thi hoán vị cạnh và hoán vị góc bằng phản xạ cơ bắp khi đang nhìn.',
      'Tôi có thể thực hiện một lần thiết lập, hoán vị, đảo ngược, sau đó đảo ngược lại để về khối Rubik đã giải.',
      'Tôi có thể xác định khi nào một ghi nhớ có số cạnh lẻ và số góc lẻ.'
    ],
    slowPracticePlan: [
      'Ngày 1: chỉ học sơ đồ chữ cái. Không bịt mắt. Chạm vào từng nhãn nhám và đọc chữ cái của nó.',
      'Ngày 2: luyện tập các mục tiêu trực tiếp D cho cạnh và V cho góc cho đến khi việc hoán vị không cần thiết lập trở nên tự nhiên.',
      'Ngày 3: luyện tập năm mục tiêu thiết lập. Đọc to thiết lập, thực hiện hoán vị, đảo ngược ngay lập tức.',
      'Ngày 4: theo vết các lượt xáo ngắn trên giấy. Dừng lại sau khi ghi nhớ; chưa thực thi.',
      'Ngày 5: thực hiện giải BLD khi đang mở mắt. Đọc ghi nhớ từ trang giấy và thực thi từng chữ cái một.',
      'Ngày 6 trở đi: chỉ thử bịt mắt khi các lần giải BLD mở mắt đã trở nên nhàm chán và lặp lại dễ dàng.'
    ],
    workedExampleScramble: 'Ví dụ xáo có hướng dẫn giải',
    guidedIntro: 'Trang này không phải là một bộ luyện tập ngẫu nhiên. Nó là một lượt giải BLD mở mắt hoàn chỉnh. Đọc từng phần theo thứ tự, nhấp vào chữ cái thực thi hiện tại và chỉ xem bước đó trên khối Rubik ở trên.',
    step1EdgeMemo: 'Bước 1: viết ghi nhớ cạnh',
    edgeMemoDesc: 'Bắt đầu từ bộ đệm cạnh `UR`. Chuỗi chữ cái bên dưới được ghép cặp chỉ để giúp bạn dễ đọc hơn.',
    edgeMemoTip1: 'Đọc to cặp đầu tiên một cách chậm rãi.',
    edgeMemoTip2: 'Chỉ vào từng chữ cái mục tiêu trên bảng sơ đồ chữ cái nếu cần.',
    edgeMemoTip3: 'Chưa thực thi vội. Bước này chỉ là ghi nhớ (memo).',
    step2CornerMemo: 'Bước 2: viết ghi nhớ góc',
    cornerMemoDesc: 'Sau cạnh, chuyển sang bộ đệm góc `LUB`. Coi các góc như một danh sách riêng biệt.',
    cornerMemoTip1: 'Đọc ghi nhớ góc sau cạnh, không lẫn lộn với cạnh.',
    cornerMemoTip2: 'Mỗi chữ cái góc vẫn có nghĩa là thiết lập, hoán vị, đảo ngược.',
    cornerMemoTip3: 'Giữ ghi nhớ góc riêng biệt cho đến khi thực thi.',
    step3CheckParity: 'Bước 3: kiểm tra parity',
    runParityAfterEdges: 'Chạy parity sau cạnh',
    noParityInExample: 'Không có parity trong ví dụ này',
    parityDesc: 'Đếm số lượng chữ cái cạnh thô và chữ cái góc thô. Nếu cả hai số lượng đều lẻ, parity sẽ được chèn vào sau tất cả các cạnh và trước góc đầu tiên.',
    step4ExecuteEdges: 'Bước 4: thực thi cạnh trước',
    executeEdgesDesc: 'Nhấp vào bước cạnh 1. Thực hiện thiết lập, hoán vị và đảo ngược của nó. Sau đó chuyển sang chữ cái cạnh tiếp theo. Đừng bắt đầu góc cho đến khi mọi hàng cạnh đã hoàn thành.',
    edgeLettersCount: 'chữ cái cạnh',
    step5ExecuteCorners: 'Bước 5: thực thi góc sau cùng',
    executeCornersDesc: 'Góc sử dụng hoán vị góc và bảng thiết lập riêng của chúng. Nếu có parity, hãy thực hiện parity trước phần này.',
    cornerLettersCount: 'chữ cái góc',
    numberedExecutionWalkthrough: 'Hướng dẫn thực thi được đánh số',
    howToUsePage: 'Cách sử dụng trang này',
    howToUseTips: [
      'Đầu tiên đọc các thẻ ghi nhớ mà không cần chạm vào Rubik.',
      'Sau đó nhấp vào hàng thực thi 1 và chỉ thực hiện hàng đó.',
      'Sau khi đảo ngược, tạm dừng và nhấp vào hàng tiếp theo.',
      'Nếu khối Rubik ở trên trông khó hiểu, hãy bỏ qua hoạt họa và đọc các mảnh thông tin của hàng.',
      'Lặp lại chính xác ví dụ này cho đến khi bạn thấy thứ tự giải trở nên quen thuộc và dễ dàng.'
    ],
    scrambleTitle: 'Lượt xáo (Scramble)',
    exampleScrambleSelect: 'Lượt xáo ví dụ',
    scrambleInputLabel: 'Đầu vào xáo',
    invalidScramble: 'Lượt xáo không hợp lệ',
    edgesCard: 'Cạnh',
    cornersCard: 'Góc',
    solved: 'Đã giải xong',
    lettersUnit: 'chữ cái',
    runParity: 'Chạy parity',
    noParity: 'Không có parity',
    parityConditionMuted: 'Số lượng cạnh và góc không cùng lẻ.',
    executionList: 'Danh sách thực thi',
    slowSolveProtocol: 'Giao thức giải chậm',
    protocolMemoTitle: 'Giai đoạn ghi nhớ',
    protocolMemoDesc: 'Đọc ghi nhớ cạnh từ trái sang phải. Ghi nhớ mỗi điểm ngắt chu kỳ trong tâm trí như một khởi đầu mới, không phải là một lỗi. Sau đó lặp lại quy trình tương tự cho các góc.',
    protocolExecTitle: 'Giai đoạn thực thi',
    protocolExecDesc: 'Nhấp vào hàng thực thi đầu tiên, chỉ thực hiện công thức đó, sau đó chuyển sang hàng tiếp theo. Đừng nhìn trước trong khi tay bạn đang chuyển động.',
    protocolErrorTitle: 'Phục hồi lỗi',
    protocolErrorDesc: 'Nếu bạn bị lạc hướng, hãy dừng lại ngay lập tức. Tìm chữ cái hoàn thành cuối cùng trong danh sách thực thi thay vì đoán công thức tiếp theo.',
    letterSchemeCube: 'Khối sơ đồ chữ cái',
    letterSchemeCubeDesc: 'Các tâm giữ nguyên tên mặt. Nhãn nhám cạnh và góc hiển thị các chữ cái ghi nhớ tương ứng cho định hướng mặc định mặt trên màu trắng, mặt trước màu xanh lá.',
    bufferStickersHighlighted: 'Các nhãn bộ đệm được làm nổi bật',
    selectedStickerLabel: 'Nhãn nhám đã chọn',
    setupMovesLabel: 'Công thức thiết lập',
    undoMovesLabel: 'Công thức đảo ngược',
    bufferLabel: 'Bộ đệm (không cần thiết lập)',
    clickToViewSetup: 'Nhấp vào chữ cái bất kỳ để xem thiết lập & đảo ngược'
  }
}
