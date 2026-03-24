import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  // ── Users ────────────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'admin@ccna.local' }, update: {},
    create: { email: 'admin@ccna.local', passwordHash: await bcrypt.hash('Admin@123456', 12), name: 'Admin', role: 'ADMIN' },
  });
  await prisma.user.upsert({
    where: { email: 'demo@ccna.local' }, update: {},
    create: { email: 'demo@ccna.local', passwordHash: await bcrypt.hash('Demo@123', 12), name: 'Demo Student', role: 'STUDENT' },
  });

  // ── Tags ─────────────────────────────────────────────────────────────────────
  const tags = ['OSI','IPv4','Subnetting','VLAN','Trunk','STP','OSPF','ACL','NAT','Wireless','Security','QoS','CLI','DHCP','EtherChannel'];
  for (const name of tags) await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });

  // ── Modules ──────────────────────────────────────────────────────────────────
  const moduleData = [
    { title: 'Nền tảng Mạng',         slug: 'foundation',       description: 'OSI, TCP/IP, IPv4, thiết bị mạng, Cisco IOS CLI', phase: 1, orderIndex: 1 },
    { title: 'VLAN & Switching',       slug: 'vlan-switching',   description: 'VLAN, Trunk 802.1Q, STP/RSTP, EtherChannel, Inter-VLAN Routing', phase: 2, orderIndex: 2 },
    { title: 'Routing',                slug: 'routing',          description: 'Static Route, OSPF, DHCP, NAT/PAT', phase: 2, orderIndex: 3 },
    { title: 'Security & Services',    slug: 'security',         description: 'ACL, Wireless 802.11, AAA, DHCP Snooping, QoS', phase: 3, orderIndex: 4 },
    { title: 'Ôn thi CCNA 200-301',   slug: 'exam-prep',        description: 'Mock exam, troubleshoot, IPv6, Network Automation', phase: 4, orderIndex: 5 },
  ];
  for (const m of moduleData) {
    await prisma.module.upsert({ where: { slug: m.slug }, update: {}, create: { ...m, isPublished: true } });
  }

  const foundation = await prisma.module.findUnique({ where: { slug: 'foundation' } });
  if (!foundation) return;

  // ── Sample Lesson: OSI Model ──────────────────────────────────────────────────
  const existing = await prisma.lesson.findFirst({ where: { moduleId: foundation.id, slug: 'mo-hinh-osi' } });
  if (existing) { console.log('✅ Seed already complete'); return; }

  const osiLesson = await prisma.lesson.create({
    data: {
      moduleId: foundation.id, title: 'Mô hình OSI & TCP/IP', slug: 'mo-hinh-osi',
      type: 'MIXED', orderIndex: 1, durationMin: 45, isPublished: true, isFree: true,
      content: [
        { type: 'heading', data: { text: 'Mô hình OSI — 7 Tầng', level: 1 } },
        { type: 'paragraph', data: { text: 'Mô hình OSI (Open Systems Interconnection) là framework chuẩn mô tả cách các hệ thống mạng giao tiếp. Được ISO phát triển năm 1984, chia truyền thông thành 7 tầng độc lập để dễ troubleshoot và thiết kế.' } },
        { type: 'keypoints', data: { points: [
          'L1 Physical: Bit, cáp đồng/quang, Hub, Repeater — tín hiệu vật lý',
          'L2 Data Link: Frame, MAC address, Switch, Bridge — kiểm soát truy cập phương tiện',
          'L3 Network: Packet, IP address, Router — định tuyến giữa các mạng',
          'L4 Transport: Segment, TCP/UDP, Port — đảm bảo end-to-end delivery',
          'L5 Session: Quản lý phiên làm việc (NetBIOS, RPC)',
          'L6 Presentation: Mã hóa, nén, định dạng (SSL/TLS, JPEG)',
          'L7 Application: Giao diện với người dùng (HTTP, DNS, FTP, SMTP)',
        ] } },
        { type: 'tip', data: { text: 'Mnemonic nhớ 7 tầng (dưới lên): "Please Do Not Throw Sausage Pizza Away" — Physical, Data Link, Network, Transport, Session, Presentation, Application. Thi CCNA hỏi rất nhiều về PDU và thiết bị từng tầng.' } },
        { type: 'heading', data: { text: 'PDU (Protocol Data Unit) từng tầng', level: 2 } },
        { type: 'table', data: {
          headers: ['Tầng', 'PDU', 'Header chứa', 'Thiết bị'],
          rows: [
            ['7 Application', 'Data', 'App headers', 'Proxy, Firewall L7'],
            ['4 Transport', 'Segment', 'Src/Dst Port, Seq, Ack, Flags', 'Firewall L4'],
            ['3 Network', 'Packet', 'Src/Dst IP, TTL, Protocol', 'Router, L3 Switch'],
            ['2 Data Link', 'Frame', 'Src/Dst MAC, Type, FCS', 'Switch, Bridge'],
            ['1 Physical', 'Bit', 'Tín hiệu điện/quang', 'Hub, Cáp, NIC'],
          ],
        } },
        { type: 'warning', data: { text: 'Lỗi hay gặp khi thi: Nhầm PDU của tầng Transport (Segment) với Network (Packet). Học thuộc thứ tự: Bit → Frame → Packet → Segment → Data.' } },
        { type: 'heading', data: { text: 'Encapsulation & Decapsulation', level: 2 } },
        { type: 'paragraph', data: { text: 'Khi dữ liệu đi từ tầng trên xuống tầng dưới (phía gửi), mỗi tầng thêm header riêng — gọi là Encapsulation. Phía nhận làm ngược lại — Decapsulation, bóc từng header từ dưới lên.' } },
        { type: 'heading', data: { text: 'So sánh OSI vs TCP/IP', level: 2 } },
        { type: 'table', data: {
          headers: ['TCP/IP Layer', 'OSI tương ứng', 'Giao thức chính'],
          rows: [
            ['Application', 'Application (7) + Presentation (6) + Session (5)', 'HTTP, HTTPS, FTP, DNS, DHCP, SMTP'],
            ['Transport', 'Transport (4)', 'TCP (reliable), UDP (fast, unreliable)'],
            ['Internet', 'Network (3)', 'IP, ICMP, OSPF, EIGRP'],
            ['Network Access', 'Data Link (2) + Physical (1)', 'Ethernet, Wi-Fi (802.11), ARP'],
          ],
        } },
        { type: 'tip', data: { text: 'TCP/IP Application gộp 3 tầng OSI (5+6+7). Đây là câu hỏi phổ biến: "Tầng Application của TCP/IP tương ứng với bao nhiêu tầng OSI?" → 3 tầng.' } },
      ],
    },
  });

  // ── Quiz for OSI ─────────────────────────────────────────────────────────────
  await prisma.quiz.create({
    data: {
      lessonId: osiLesson.id, title: 'Quiz: Mô hình OSI & TCP/IP',
      passingScore: 70, timeLimit: 15,
      questions: { create: [
        {
          text: 'Tầng nào của mô hình OSI chịu trách nhiệm định tuyến packet giữa các mạng?',
          type: 'SINGLE_CHOICE', orderIndex: 1, points: 1,
          explanation: 'Tầng Network (L3) định tuyến packet dựa trên địa chỉ IP. Router là thiết bị chính ở tầng này.',
          options: { create: [
            { text: 'Data Link (L2)', isCorrect: false, orderIndex: 1 },
            { text: 'Network (L3)', isCorrect: true, orderIndex: 2 },
            { text: 'Transport (L4)', isCorrect: false, orderIndex: 3 },
            { text: 'Application (L7)', isCorrect: false, orderIndex: 4 },
          ] },
        },
        {
          text: 'PDU ở tầng Transport được gọi là gì?',
          type: 'SINGLE_CHOICE', orderIndex: 2, points: 1,
          explanation: 'PDU từng tầng: Bit (L1), Frame (L2), Packet (L3), Segment (L4). Transport = Segment.',
          options: { create: [
            { text: 'Bit', isCorrect: false, orderIndex: 1 },
            { text: 'Frame', isCorrect: false, orderIndex: 2 },
            { text: 'Packet', isCorrect: false, orderIndex: 3 },
            { text: 'Segment', isCorrect: true, orderIndex: 4 },
          ] },
        },
        {
          text: 'TCP/IP Application layer tương ứng với bao nhiêu tầng OSI?',
          type: 'SINGLE_CHOICE', orderIndex: 3, points: 1,
          explanation: 'TCP/IP Application = OSI Application (7) + Presentation (6) + Session (5) = 3 tầng.',
          options: { create: [
            { text: '1 tầng', isCorrect: false, orderIndex: 1 },
            { text: '2 tầng', isCorrect: false, orderIndex: 2 },
            { text: '3 tầng', isCorrect: true, orderIndex: 3 },
            { text: '4 tầng', isCorrect: false, orderIndex: 4 },
          ] },
        },
        {
          text: 'Thiết bị nào sau đây hoạt động ở tầng Data Link (L2)? (Chọn tất cả đúng)',
          type: 'MULTIPLE_CHOICE', orderIndex: 4, points: 2,
          explanation: 'Switch và Bridge hoạt động ở L2 dựa trên MAC address. Hub ở L1, Router ở L3.',
          options: { create: [
            { text: 'Switch', isCorrect: true, orderIndex: 1 },
            { text: 'Router', isCorrect: false, orderIndex: 2 },
            { text: 'Bridge', isCorrect: true, orderIndex: 3 },
            { text: 'Hub', isCorrect: false, orderIndex: 4 },
          ] },
        },
        {
          text: 'Giao thức SSL/TLS hoạt động ở tầng nào của OSI?',
          type: 'SINGLE_CHOICE', orderIndex: 5, points: 1,
          explanation: 'SSL/TLS là tầng Presentation (L6) — mã hóa và định dạng dữ liệu.',
          options: { create: [
            { text: 'Application (L7)', isCorrect: false, orderIndex: 1 },
            { text: 'Presentation (L6)', isCorrect: true, orderIndex: 2 },
            { text: 'Session (L5)', isCorrect: false, orderIndex: 3 },
            { text: 'Transport (L4)', isCorrect: false, orderIndex: 4 },
          ] },
        },
      ] },
    },
  });

  // ── Lab for OSI ───────────────────────────────────────────────────────────────
  await prisma.lab.create({
    data: {
      lessonId: osiLesson.id, title: 'Lab: Quan sát PDU trong Packet Tracer',
      description: 'Dùng Simulation Mode trong Packet Tracer để quan sát PDU đi qua từng tầng OSI khi ping.',
      objectives: [
        'Tạo topology: PC — Switch — Router — PC',
        'Dùng Simulation Mode capture traffic ICMP',
        'Phân tích PDU tại mỗi tầng (MAC, IP, ICMP)',
        'Hiểu Encapsulation và Decapsulation thực tế',
      ],
      toolRequired: 'Packet Tracer', durationMin: 30,
      instructions: [
        { step: 1, title: 'Tạo topology', description: 'Kéo: 2 PC, 1 Switch (2960), 1 Router (2911). Nối: PC0→SW1→R1 (G0/0), R1 (G0/1)→SW1→PC1', commands: [], verification: 'Tất cả đèn link màu xanh' },
        { step: 2, title: 'Cấu hình IP', description: 'PC0: 192.168.1.10/24 GW 192.168.1.1 | PC1: 192.168.2.10/24 GW 192.168.2.1', commands: ['R1(config)# interface g0/0','R1(config-if)# ip address 192.168.1.1 255.255.255.0','R1(config-if)# no shutdown','R1(config)# interface g0/1','R1(config-if)# ip address 192.168.2.1 255.255.255.0','R1(config-if)# no shutdown'], verification: 'show ip interface brief — interfaces phải up/up' },
        { step: 3, title: 'Simulation Mode', description: 'Click nút Simulation (đồng hồ góc dưới phải). Add Simple PDU từ PC0 đến PC1. Click Capture/Forward từng bước.', commands: ['PC> ping 192.168.2.10'], verification: 'Quan sát envelope di chuyển qua từng thiết bị' },
        { step: 4, title: 'Phân tích tại Switch', description: 'Click vào packet ở SW1. Xem Layer 2: Src MAC = PC0, Dst MAC = R1 interface G0/0 (ARP trước). Layer 3 không thay đổi.', commands: [], verification: 'MAC destination là địa chỉ của R1, không phải PC1 đích cuối' },
        { step: 5, title: 'Phân tích tại Router', description: 'Click packet ở R1. So sánh: MAC inbound (src=PC0) vs outbound (src=R1 G0/1). IP address không đổi suốt hành trình.', commands: [], verification: 'IP src=192.168.1.10, dst=192.168.2.10 không thay đổi — MAC thay đổi mỗi hop' },
      ],
    },
  });

  // ── Lesson 2: IPv4 & Subnetting ───────────────────────────────────────────────
  await prisma.lesson.create({
    data: {
      moduleId: foundation.id, title: 'IPv4 & Subnetting', slug: 'ipv4-subnetting',
      type: 'THEORY', orderIndex: 2, durationMin: 60, isPublished: true,
      content: [
        { type: 'heading', data: { text: 'Địa chỉ IPv4 & Phân lớp', level: 1 } },
        { type: 'table', data: {
          headers: ['Class', 'Dải IP', 'Subnet Mask mặc định', 'Private Range (RFC1918)'],
          rows: [
            ['A', '1.0.0.0 – 126.255.255.255', '255.0.0.0 (/8)', '10.0.0.0 – 10.255.255.255'],
            ['B', '128.0.0.0 – 191.255.255.255', '255.255.0.0 (/16)', '172.16.0.0 – 172.31.255.255'],
            ['C', '192.0.0.0 – 223.255.255.255', '255.255.255.0 (/24)', '192.168.0.0 – 192.168.255.255'],
          ],
        } },
        { type: 'tip', data: { text: '127.0.0.1 = loopback (không dùng trên mạng). 169.254.x.x = APIPA (máy không lấy được DHCP). 0.0.0.0 = default route.' } },
        { type: 'heading', data: { text: 'Subnetting nhanh không cần máy tính', level: 2 } },
        { type: 'keypoints', data: { points: [
          'Học thuộc block size: /25=128, /26=64, /27=32, /28=16, /29=8, /30=4',
          'Network address: làm tròn xuống theo block size',
          'Broadcast: Network + block - 1',
          'Host range: Network+1 đến Broadcast-1',
          'Ví dụ: 192.168.1.200/27 → Block=32, dải: 192,224 → Network:.192, Broadcast:.223, Host:.193-.222',
        ] } },
        { type: 'warning', data: { text: 'Thi CCNA KHÔNG cho dùng máy tính. Phải tính subnet trong <30 giây. Luyện tại subnettingpractice.com mỗi ngày.' } },
      ],
    },
  });

  console.log('✅ Seed complete!');
  console.log('Admin: admin@ccna.local / Admin@123456');
  console.log('Demo:  demo@ccna.local  / Demo@123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
