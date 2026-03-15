import { Box } from "@mui/material";
import { useRef, useState } from "react";
import type { TransactionItem } from "../../types/transaction";
import TransactionListItem from "./TransactionListItem";

const SWIPE_THRESHOLD = 60;
const DELETE_WIDTH = 72;

interface SwipeableTransactionItemProps {
  transaction: TransactionItem;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const SwipeableTransactionItem: React.FC<SwipeableTransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientX - startX.current;
    const newOffset = Math.max(-DELETE_WIDTH, Math.min(0, delta));
    setOffsetX(newOffset);
  };

  const handleTouchEnd = () => {
    if (offsetX <= -SWIPE_THRESHOLD && onDelete) {
      if (window.confirm("이 거래를 삭제할까요?")) {
        onDelete(transaction.id);
      }
      setOffsetX(0);
    } else {
      setOffsetX(0);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        mb: 1,
        borderRadius: 2,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          transform: `translateX(${offsetX}px)`,
          transition: offsetX === 0 ? "transform 0.2s ease-out" : "none",
        }}
      >
        <TransactionListItem
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </Box>
    </Box>
  );
};

export default SwipeableTransactionItem;
