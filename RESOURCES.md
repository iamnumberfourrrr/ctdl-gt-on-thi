# CTDL&GT Resources

## Knowledge

- Đề mẫu: `VB2_2025-2026 - HK1 - De - CTDL&GT De1.pdf` (thư mục này)
  Nguồn chuẩn nhất về dạng câu hỏi, quy ước (thế mạng B-Tree, Catenate với node liền trước, ký hiệu DEL). Use for: mọi bài; luyện đề cuối.
- Ảnh "Nội dung ôn tập" của giáo viên (tin nhắn đầu tiên, tóm tắt trong MISSION.md)
  Phạm vi thi chính thức. Use for: quyết định học gì / bỏ gì.
- Sách: _Giáo trình Cấu trúc dữ liệu và Giải thuật_ — Trần Hạnh Nhi, Dương Anh Đức (ĐHQG TP.HCM)
  Giáo trình gốc của khối ĐHQG; mã C/C++ trong đề (QuickSort phần tử giữa, Shift/CreateHeap, LIST pHead/pTail) theo phong cách sách này. Use for: đối chiếu code mẫu.
- [Article: "The Ubiquitous B-Tree" — Douglas Comer, ACM Computing Surveys 1979](https://users.cs.utah.edu/~pandey/courses/cs6530/fall23/papers/trees/p121-comer.pdf)
  Bài kinh điển định nghĩa các thuật ngữ underflow, redistribution, concatenation khi xóa B-Tree. Use for: lý thuyết B-Tree, nguồn gốc thuật ngữ "Catenation".
- [Tool: B-Tree Visualization — David Galles, USFCA](https://www.cs.usfca.edu/~galles/visualization/BTree.html)
  Mô phỏng chèn/xóa với Max Degree = 3 / 5. Use for: tự kiểm tra bài chèn. Lưu ý: quy ước xóa có thể khác đề (đề dùng khóa thế mạng = lớn nhất nhỏ hơn x).
- [Tool: VisuAlgo — Hash Table](https://visualgo.net/en/hashtable)
  Mô phỏng Linear/Quadratic probing, Double hashing, Separate chaining (NUS). Use for: kiểm tra bảng băm.
- [Tool: VisuAlgo — Sorting](https://visualgo.net/en/sorting) · [BST](https://visualgo.net/en/bst) · [Linked List](https://visualgo.net/en/list) · [Heap](https://visualgo.net/en/heap)
  Hoạt hình từng bước. Use for: chạy tay sắp xếp, BST, DSLK.
- [Book chapter: OpenDSA — Hashing Deletion (tombstones)](https://opendsa-server.cs.vt.edu/ODSA/Books/CS3/html/HashDel.html)
  Giải thích vì sao xóa trong địa chỉ mở phải đánh dấu DEL (tombstone) chứ không làm trống. Use for: câu 8 (Empty/Deleted/Occupied).
- [Book: _Open Data Structures_ — Pat Morin](https://opendatastructures.org/)
  Sách mở, chặt chẽ: DSLK (ch.3), hashing (ch.5), BST (ch.6), B-Tree (ch.14). Use for: đọc sâu khi bị hổng lý thuyết.
- [Article: Binary search — Wikipedia](https://en.wikipedia.org/wiki/Binary_search)
  Số lần so sánh xấu nhất ⌊log₂n⌋+1. Use for: đếm phép so sánh nhị phân.

## Wisdom (Communities)

- [courses.uit.edu.vn](https://courses.uit.edu.vn/) — diễn đàn môn học + giảng viên/trợ giảng
  Nơi duy nhất xác nhận quy ước chấm (load factor, ưu tiên mượn khóa B-Tree…). Use for: hỏi các điểm còn mơ hồ trước ngày thi.
- Nhóm lớp / bạn cùng lớp VB2
  Use for: chấm chéo bài vẽ cây, so đáp án đề mẫu.

## Gaps

- Chưa có slide chính thức của lớp: quy ước khi B-Tree vừa có thể mượn trái vừa mượn phải chưa được đề nêu rõ (workspace giả định ưu tiên node liền trước).
- Cách hiểu "Load factor 0.6" trong câu 7 đề mẫu là suy luận — cần xác nhận với giảng viên.
