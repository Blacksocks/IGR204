# exe
REDUCE      = reducing
COMPUTE     = computing

# arguments
FILE_IN     = "../data/homicides.csv"
REDUCE_OUT  = "../data/homicides_small.csv"
RATIO       = "0.01"
COMPUTE_OUT = "../data/sunburst"

# compilation flags
CFLAGS      = -std=gnu99 -Werror -Wall -Wextra

.PHONY: reduce compute

default:
	@echo "use 'make reduce' or 'make compute'"

reduce: $(REDUCE)
	./$< $(FILE_IN) $(REDUCE_OUT) $(RATIO)
	rm -f $<

compute: $(COMPUTE)
	./$< $(FILE_IN) $(COMPUTE_OUT)
	rm -f $<
